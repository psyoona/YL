using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class OrderInfo
	{
		[JsonPropertyName("id")]
		public int ID { get; set; }

		[JsonPropertyName("orderNo")]
		public string ORDER_NO { get; set; } = string.Empty;

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

		[JsonPropertyName("orderStatus")]
		public string ORDER_STATUS { get; set; } = string.Empty;

		[JsonPropertyName("reason")]
		public string REASON { get; set; } = string.Empty;

		[JsonPropertyName("createdAt")]
		public DateTime CREATED_AT { get; set; }

		[JsonPropertyName("updatedAt")]
		public DateTime UPDATED_AT { get; set; }
	}
}
