import { NextResponse } from 'next/server';
import { checkDatabaseConnection, query } from '@/lib/dbClient';
import { mockData } from '@/lib/mockDb';

export async function POST(req: Request) {
  try {
    const { request_id, warehouse_id, allocated_by, remark } = await req.json();

    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      try {
        // Call MySQL Stored Procedure sp_allocate_supplies_atomic
        const result: any = await query(`
          CALL sp_allocate_supplies_atomic(?, ?, ?, ?, @p_alloc_id, @p_status_code, @p_msg);
          SELECT @p_alloc_id AS allocation_id, @p_status_code AS status_code, @p_msg AS status_message;
        `, [request_id, warehouse_id, allocated_by || 2, remark || 'Supplies committed']);

        const output = Array.isArray(result.rows) && result.rows.length > 1 ? result.rows[1][0] : result.rows[0];

        if (output && output.status_code === 'SUCCESS') {
          return NextResponse.json({
            success: true,
            source: 'MYSQL_STORED_PROCEDURE_TRANSACTION',
            allocation_id: output.allocation_id,
            message: output.status_message,
          });
        } else {
          return NextResponse.json({
            success: false,
            source: 'MYSQL_STORED_PROCEDURE_ROLLED_BACK',
            error: output?.status_message || 'Allocation transaction aborted by stored procedure.',
          }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    // In-memory simulation of stored procedure sp_allocate_supplies_atomic with transaction validation
    const request = mockData.requests.find(r => r.request_id === Number(request_id));
    if (!request) {
      return NextResponse.json({ success: false, error: 'Requisition not found' }, { status: 404 });
    }

    if ((request as any).status !== 'Pending' && (request as any).status !== 'Approved') {
      return NextResponse.json({
        success: false,
        error: `Transaction Aborted: Requisition is already in status '${(request as any).status}'!`
      }, { status: 400 });
    }

    // Check inventory stock in the selected warehouse for all items
    const warehouseStock = mockData.inventory.filter(i => i.warehouse_id === Number(warehouse_id));
    for (const item of request.items) {
      const stock = warehouseStock.find(s => s.resource_id === item.resource_id);
      if (!stock || stock.quantity_available < item.quantity_requested) {
        return NextResponse.json({
          success: false,
          error: `ACID Rollback Triggered: Warehouse does not have sufficient quantity for '${item.resource_name}'. Requested: ${item.quantity_requested}, Available: ${stock?.quantity_available || 0}!`
        }, { status: 400 });
      }
    }

    // Atomic deduction of inventory
    for (const item of request.items) {
      const stock = warehouseStock.find(s => s.resource_id === item.resource_id);
      if (stock) {
        stock.quantity_available -= item.quantity_requested;
        stock.last_updated = new Date().toISOString().replace('T', ' ').slice(0, 19);
      }
    }

    // Update request status
    (request as any).status = 'Allocated';

    return NextResponse.json({
      success: true,
      source: 'IN_MEMORY_TRANSACTION_SIMULATED',
      message: `Transaction Committed: Requisition #${request_id} allocated from Warehouse #${warehouse_id}. Stock deducted atomically.`,
      request
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
