using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class AlbumRole
	{
		[JsonPropertyName("roleId")]
		public int ROLE_ID { get; set; }

		[JsonPropertyName("roleName")]
		public string ROLE_NAME { get; set; } = string.Empty;
	}
}
