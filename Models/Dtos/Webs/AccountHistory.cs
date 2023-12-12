namespace YL.Models.Dtos.Webs
{
	public class AccountHistory
	{
		public string AccountNo { get; set; }

		public string Description { get; set; }

		public int Delta { get; set; }

		public int TempBalance { get; set; }

		public DateTime UsingDate { get; set; }
	}
}
