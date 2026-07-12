using System.Text.Json;
using YL.Models.Dtos.Webs;

namespace YL.Tests;

public class OrderInfoContractTests
{
	[Fact]
	public void Order_payload_keeps_existing_and_reconciliation_properties()
	{
		var json = JsonSerializer.Serialize(new OrderInfo
		{
			ID = 1,
			ORDER_NO = "0000807300",
			STOCK_CODE = "394280",
			STOCK_NAME = "오픈엣지테크놀로지",
			ORDER_TYPE = "SELL",
			ORDER_PRICE = 10_400m,
			ORDER_QUANTITY = 7,
			FILLED_QUANTITY = 7,
			FILLED_PRICE = 10_400m,
			ORDER_STATUS = "FILLED",
			ESTIMATED_COMMISSION = 10.92m,
			ESTIMATED_TAX = 131.04m,
			REALIZED_PROFIT = -1_820m,
			NET_REALIZED_PROFIT = -1_961.96m,
			LAST_RECONCILED_AT = new DateTime(2026, 7, 12, 12, 0, 0),
			RECONCILIATION_NOTE = "KIS execution"
		});

		using var document = JsonDocument.Parse(json);
		var root = document.RootElement;
		Assert.Equal("0000807300", root.GetProperty("orderNo").GetString());
		Assert.Equal(10.92m, root.GetProperty("estimatedCommission").GetDecimal());
		Assert.Equal(131.04m, root.GetProperty("estimatedTax").GetDecimal());
		Assert.Equal(-1_820m, root.GetProperty("realizedProfit").GetDecimal());
		Assert.Equal(-1_961.96m, root.GetProperty("netRealizedProfit").GetDecimal());
		Assert.Equal("KIS execution", root.GetProperty("reconciliationNote").GetString());
		Assert.True(root.TryGetProperty("lastReconciledAt", out _));
	}

	[Fact]
	public void Unfilled_order_serializes_nullable_execution_values_safely()
	{
		var json = JsonSerializer.Serialize(new OrderInfo { ORDER_STATUS = "ACCEPTED" });

		using var document = JsonDocument.Parse(json);
		var root = document.RootElement;
		Assert.Equal(JsonValueKind.Null, root.GetProperty("filledPrice").ValueKind);
		Assert.Equal(JsonValueKind.Null, root.GetProperty("realizedProfit").ValueKind);
		Assert.Equal(JsonValueKind.Null, root.GetProperty("netRealizedProfit").ValueKind);
		Assert.Equal(JsonValueKind.Null, root.GetProperty("lastReconciledAt").ValueKind);
		Assert.Equal(JsonValueKind.Null, root.GetProperty("reconciliationNote").ValueKind);
	}
}
