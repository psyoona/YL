namespace YL.Models.Dtos.Webs
{
	public class AccountMainData
	{
		public string AccountNo { get; set; }

		public int Balance { get; set; }

		public List<AccountHistory> AccountHistoryList { get; set; }
	}
}
