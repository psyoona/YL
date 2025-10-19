using System.Data;
using Microsoft.Data.SqlClient;
using YL.Configs;
using YL.Functions;
using YL.Models.Dtos.Webs;

namespace YL.Services
{
	public class LottoService
	{
		public List<LottoInformation> GetLottoList(int pageNumber, int pageSize, int? turn = null, 
			int? number1 = null, int? number2 = null, int? number3 = null, 
			int? number4 = null, int? number5 = null, int? number6 = null, int? bonus = null)
		{
			List<LottoInformation> lottoList = new List<LottoInformation>();

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				// Build WHERE clause
				List<string> whereConditions = new List<string>();
				List<SqlParameter> parameters = new List<SqlParameter>();

				if (turn.HasValue)
				{
					whereConditions.Add("Turn = @Turn");
					parameters.Add(new SqlParameter("@Turn", turn.Value));
				}

				if (number1.HasValue)
				{
					whereConditions.Add("Number1 = @Number1");
					parameters.Add(new SqlParameter("@Number1", number1.Value));
				}

				if (number2.HasValue)
				{
					whereConditions.Add("Number2 = @Number2");
					parameters.Add(new SqlParameter("@Number2", number2.Value));
				}

				if (number3.HasValue)
				{
					whereConditions.Add("Number3 = @Number3");
					parameters.Add(new SqlParameter("@Number3", number3.Value));
				}

				if (number4.HasValue)
				{
					whereConditions.Add("Number4 = @Number4");
					parameters.Add(new SqlParameter("@Number4", number4.Value));
				}

				if (number5.HasValue)
				{
					whereConditions.Add("Number5 = @Number5");
					parameters.Add(new SqlParameter("@Number5", number5.Value));
				}

				if (number6.HasValue)
				{
					whereConditions.Add("Number6 = @Number6");
					parameters.Add(new SqlParameter("@Number6", number6.Value));
				}

				if (bonus.HasValue)
				{
					whereConditions.Add("NumberBonus = @Bonus");
					parameters.Add(new SqlParameter("@Bonus", bonus.Value));
				}

				string whereClause = whereConditions.Count > 0 
					? "WHERE " + string.Join(" AND ", whereConditions) 
					: "";

				parameters.Add(new SqlParameter("@PageNumber", pageNumber));
				parameters.Add(new SqlParameter("@PageSize", pageSize));

				string query = $@"
					SELECT * FROM (
						SELECT *, ROW_NUMBER() OVER (ORDER BY Turn DESC) AS RowNum
						FROM HWSY.dbo.Lotto_Information
						{whereClause}
					) AS NumberedResults
					WHERE RowNum BETWEEN ((@PageNumber - 1) * @PageSize + 1) AND (@PageNumber * @PageSize)
					ORDER BY Turn DESC";

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text,
					query, parameters.ToArray()))
				{
					lottoList = Binder.BindToList<LottoInformation>(reader);
				}
			}

			return lottoList;
		}

		public LottoInformation GetLottoByTurn(int turn)
		{
			LottoInformation lotto = new LottoInformation();

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				SqlParameter[] parameters = new SqlParameter[]
				{
					new SqlParameter("@Turn", turn)
				};

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text,
					"SELECT * FROM HWSY.dbo.Lotto_Information WHERE Turn = @Turn", parameters))
				{
					if (reader.Read())
					{
						lotto = (LottoInformation)Binder.BindToModel(reader, lotto);
					}
				}
			}

			return lotto;
		}

		public int GetTotalCount(int? turn = null, int? number1 = null, int? number2 = null, 
			int? number3 = null, int? number4 = null, int? number5 = null, 
			int? number6 = null, int? bonus = null)
		{
			int count = 0;

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				// Build WHERE clause
				List<string> whereConditions = new List<string>();
				List<SqlParameter> parameters = new List<SqlParameter>();

				if (turn.HasValue)
				{
					whereConditions.Add("Turn = @Turn");
					parameters.Add(new SqlParameter("@Turn", turn.Value));
				}

				if (number1.HasValue)
				{
					whereConditions.Add("Number1 = @Number1");
					parameters.Add(new SqlParameter("@Number1", number1.Value));
				}

				if (number2.HasValue)
				{
					whereConditions.Add("Number2 = @Number2");
					parameters.Add(new SqlParameter("@Number2", number2.Value));
				}

				if (number3.HasValue)
				{
					whereConditions.Add("Number3 = @Number3");
					parameters.Add(new SqlParameter("@Number3", number3.Value));
				}

				if (number4.HasValue)
				{
					whereConditions.Add("Number4 = @Number4");
					parameters.Add(new SqlParameter("@Number4", number4.Value));
				}

				if (number5.HasValue)
				{
					whereConditions.Add("Number5 = @Number5");
					parameters.Add(new SqlParameter("@Number5", number5.Value));
				}

				if (number6.HasValue)
				{
					whereConditions.Add("Number6 = @Number6");
					parameters.Add(new SqlParameter("@Number6", number6.Value));
				}

				if (bonus.HasValue)
				{
					whereConditions.Add("NumberBonus = @Bonus");
					parameters.Add(new SqlParameter("@Bonus", bonus.Value));
				}

				string whereClause = whereConditions.Count > 0 
					? "WHERE " + string.Join(" AND ", whereConditions) 
					: "";

				string query = $"SELECT COUNT(*) FROM HWSY.dbo.Lotto_Information {whereClause}";

				object result = SqlHelper.ExecuteScalar(connection, CommandType.Text, query, parameters.ToArray());
				
				if (result != null)
				{
					count = Convert.ToInt32(result);
				}
			}

			return count;
		}
	}
}
