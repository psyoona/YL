using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class OrderInfo
	{
		[JsonPropertyName("id")]
		public int ID { get; set; }

		[JsonPropertyName("orderNo")]
		public string ORDER_NO { get; set; } = string.Empty;

		[JsonPropertyName("parentOrderId")]
		public int? PARENT_ORDER_ID { get; set; }

		[JsonPropertyName("stockCode")]
		public string STOCK_CODE { get; set; } = string.Empty;

		[JsonPropertyName("stockName")]
		public string STOCK_NAME { get; set; } = string.Empty;

		[JsonPropertyName("orderType")]
		public string ORDER_TYPE { get; set; } = string.Empty;

		[JsonPropertyName("orderPrice")]
		public decimal ORDER_PRICE { get; set; }

		[JsonPropertyName("orderQuantity")]
		public int ORDER_QUANTITY { get; set; }

		[JsonPropertyName("filledQuantity")]
		public int FILLED_QUANTITY { get; set; }

		[JsonPropertyName("filledPrice")]
		public decimal? FILLED_PRICE { get; set; }

		[JsonPropertyName("costBasisPrice")]
		public decimal? COST_BASIS_PRICE { get; set; }

		[JsonPropertyName("estimatedCommission")]
		public decimal ESTIMATED_COMMISSION { get; set; }

		[JsonPropertyName("estimatedTax")]
		public decimal ESTIMATED_TAX { get; set; }

		[JsonPropertyName("realizedProfit")]
		public decimal? REALIZED_PROFIT { get; set; }

		[JsonPropertyName("netRealizedProfit")]
		public decimal? NET_REALIZED_PROFIT { get; set; }

		[JsonPropertyName("orderStatus")]
		public string ORDER_STATUS { get; set; } = string.Empty;

		[JsonPropertyName("reason")]
		public string REASON { get; set; } = string.Empty;

		[JsonPropertyName("createdAt")]
		public DateTime CREATED_AT { get; set; }

		[JsonPropertyName("updatedAt")]
		public DateTime UPDATED_AT { get; set; }

		[JsonPropertyName("filledAt")]
		public DateTime? FILLED_AT { get; set; }

		[JsonPropertyName("lastReconciledAt")]
		public DateTime? LAST_RECONCILED_AT { get; set; }

		[JsonPropertyName("reconciliationNote")]
		public string? RECONCILIATION_NOTE { get; set; }
	}
}
