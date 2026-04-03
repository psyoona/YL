namespace YL.Models.Dtos.Commons
{
	public static class AlbumErrors
	{
		public static readonly (int Code, string Message) LoginRequired = (1001, "로그인이 필요합니다.");
		public static readonly (int Code, string Message) Unauthorized = (1002, "권한이 없습니다.");
		public static readonly (int Code, string Message) AlbumAccessDenied = (1003, "접근 권한이 없습니다.");

		public static readonly (int Code, string Message) AlbumNameRequired = (2001, "앨범 폴더명을 입력해주세요.");
		public static readonly (int Code, string Message) AlbumNameInvalidChars = (2002, "앨범 폴더명에 사용할 수 없는 문자가 포함되어 있습니다.");
		public static readonly (int Code, string Message) AlbumNameStartsWithDot = (2003, "앨범 폴더명은 '.'으로 시작할 수 없습니다.");
		public static readonly (int Code, string Message) AlbumCreateFailed = (2004, "앨범 생성에 실패했습니다. 이미 존재하는 이름입니다.");
		public static readonly (int Code, string Message) AlbumNameOrDisplayRequired = (2005, "앨범명과 표시명을 입력해주세요.");
		public static readonly (int Code, string Message) AlbumUpdateFailed = (2006, "앨범 수정에 실패했습니다.");
		public static readonly (int Code, string Message) AlbumDeleteNameRequired = (2007, "앨범명을 입력해주세요.");
		public static readonly (int Code, string Message) AlbumDeleteFailed = (2008, "앨범 삭제에 실패했습니다.");

		public static readonly (int Code, string Message) UnsupportedImageFormat = (3001, "지원하지 않는 이미지 형식입니다.");

		public static readonly (int Code, string Message) RoleAlreadyExists = (4001, "이미 존재하는 역할입니다.");
		public static readonly (int Code, string Message) SystemRoleCannotDelete = (4002, "시스템 마스터 역할은 삭제할 수 없습니다.");
		public static readonly (int Code, string Message) RoleAlreadyAssigned = (4003, "이미 할당된 역할입니다.");
		public static readonly (int Code, string Message) RoleRemoveFailed = (4004, "역할 제거에 실패했습니다.");
		public static readonly (int Code, string Message) AccessAlreadyExists = (4005, "이미 설정된 접근 권한입니다.");
		public static readonly (int Code, string Message) AccessRemoveFailed = (4006, "접근 권한 제거에 실패했습니다.");
	}
}
