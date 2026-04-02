using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class AlbumUserInfo
	{
		[JsonPropertyName("phoneNumber")]
		public string PHONE_NUMBER { get; set; } = string.Empty;

		[JsonPropertyName("userName")]
		public string USER_NAME { get; set; } = string.Empty;

		[JsonPropertyName("isActive")]
		public bool IS_ACTIVE { get; set; }
	}
}
