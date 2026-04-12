namespace YL.Models.Dtos.Commons
{
	public static class StockErrors
	{
		public const int LoginRequired = 5001;
		public const int StockCodeRequired = 5002;
		public const int StockNameRequired = 5003;
		public const int StockCreateFailed = 5004;
		public const int StockUpdateFailed = 5005;
		public const int StockDeleteFailed = 5006;

		public static string GetMessage(int code) => code switch
		{
			LoginRequired => "로그인이 필요합니다.",
			StockCodeRequired => "종목코드를 입력해주세요.",
			StockNameRequired => "종목명을 입력해주세요.",
			StockCreateFailed => "이미 등록된 종목이거나 종목 추가에 실패했습니다.",
			StockUpdateFailed => "종목 수정에 실패했습니다.",
			StockDeleteFailed => "종목 삭제에 실패했습니다.",
			_ => "알 수 없는 오류가 발생했습니다."
		};
	}
}
