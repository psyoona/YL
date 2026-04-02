using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class AlbumAccessMapping
	{
		[JsonPropertyName("accessId")]
		public int ACCESS_ID { get; set; }

		[JsonPropertyName("albumName")]
		public string ALBUM_NAME { get; set; } = string.Empty;

		[JsonPropertyName("roleId")]
		public int ROLE_ID { get; set; }

		[JsonPropertyName("roleName")]
		public string ROLE_NAME { get; set; } = string.Empty;
	}
}
