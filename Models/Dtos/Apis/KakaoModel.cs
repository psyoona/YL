using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Apis
{
	public class KakaoModel
	{
		[JsonPropertyName("action")]
		public KakaoAction Action { get; set; }
	}
}
