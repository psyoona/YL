using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Apis
{
	public class KakaoModel
	{
		[JsonPropertyName("userRequest")]
		public KakaoUserRequest UserRequest { get; set; }
	}
}
