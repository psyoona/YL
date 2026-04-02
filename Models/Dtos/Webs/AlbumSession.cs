namespace YL.Models.Dtos.Webs
{
	public class AlbumSession
	{
		public string PhoneNumber { get; set; }

		public string UserName { get; set; }

		public string Roles { get; set; }

		public string RoleIds { get; set; }

		public string ServerVersion { get; set; }

		public bool IsSystemMaster { get; set; }

		public long ExpiresAt { get; set; }
	}
}
