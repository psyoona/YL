namespace YL.Models.Dtos.Commons
{
	public class CustomException : Exception
	{
		public int Code { get; set; }

		public CustomException(int code) : base()
		{
			Code = code;
		}
	}
}
