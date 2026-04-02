using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class AlbumUserRoleMapping
	{
		[JsonPropertyName("userRoleId")]
		public int USER_ROLE_ID { get; set; }

		[JsonPropertyName("phoneNumber")]
		public string PHONE_NUMBER { get; set; } = string.Empty;

		[JsonPropertyName("userName")]
		public string USER_NAME { get; set; } = string.Empty;

		[JsonPropertyName("roleId")]
		public int ROLE_ID { get; set; }

		[JsonPropertyName("roleName")]
		public string ROLE_NAME { get; set; } = string.Empty;
	}
}
