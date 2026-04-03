namespace YL.Models.Dtos.Commons
{
	public class CustomException : Exception
	{
		public int Code { get; set; }

		public string CustomMessage { get; set; }

		public CustomException(int code, string message)
		{
			Code = code;
			CustomMessage = message;
		}

		public CustomException((int Code, string Message) error)
		{
			Code = error.Code;
			CustomMessage = error.Message;
		}
	}
}