namespace YL.Models.Dtos.Commons
{
	public static class AlbumErrors
	{
		public const int LoginRequired = 1001;
		public const int Unauthorized = 1002;
		public const int AlbumAccessDenied = 1003;

		public const int AlbumNameRequired = 2001;
		public const int AlbumNameInvalidChars = 2002;
		public const int AlbumNameStartsWithDot = 2003;
		public const int AlbumCreateFailed = 2004;
		public const int AlbumNameOrDisplayRequired = 2005;
		public const int AlbumUpdateFailed = 2006;
		public const int AlbumDeleteNameRequired = 2007;
		public const int AlbumDeleteFailed = 2008;

		public const int UnsupportedImageFormat = 3001;

		public const int RoleAlreadyExists = 4001;
		public const int SystemRoleCannotDelete = 4002;
		public const int RoleAlreadyAssigned = 4003;
		public const int RoleRemoveFailed = 4004;
		public const int AccessAlreadyExists = 4005;
		public const int AccessRemoveFailed = 4006;
	}
}
