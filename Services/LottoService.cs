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

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text, query, parameters.ToArray()))
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

		public Dictionary<string, object> GetDashboardStats()
		{
			Dictionary<string, object> stats = new Dictionary<string, object>();

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				string query = @"
					SELECT 
						COUNT(*) AS TotalTurns,
						MAX(Reward1) AS MaxReward,
						AVG(CAST(Reward1 AS BIGINT)) AS AvgReward,
						MAX(Date) AS LatestDate,
						(SELECT TOP 1 Turn FROM HWSY.dbo.Lotto_Information ORDER BY Reward1 DESC) AS MaxRewardTurn
					FROM HWSY.dbo.Lotto_Information";

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text, query, null))
				{
					if (reader.Read())
					{
						stats["TOTAL_TURNS"] = reader["TotalTurns"];
						stats["MAX_REWARD"] = reader["MaxReward"];
						stats["AVG_REWARD"] = reader["AvgReward"];
						stats["LATEST_DATE"] = reader["LatestDate"];
						stats["MAX_REWARD_TURN"] = reader["MaxRewardTurn"];
					}
				}
			}

			return stats;
		}

		public List<Dictionary<string, object>> GetNumberFrequency()
		{
			List<Dictionary<string, object>> frequency = new List<Dictionary<string, object>>();

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				string query = @"
					SELECT TOP 20 Number, COUNT(*) AS Frequency
					FROM (
						SELECT Number1 AS Number FROM HWSY.dbo.Lotto_Information
						UNION ALL SELECT Number2 FROM HWSY.dbo.Lotto_Information
						UNION ALL SELECT Number3 FROM HWSY.dbo.Lotto_Information
						UNION ALL SELECT Number4 FROM HWSY.dbo.Lotto_Information
						UNION ALL SELECT Number5 FROM HWSY.dbo.Lotto_Information
						UNION ALL SELECT Number6 FROM HWSY.dbo.Lotto_Information
					) AS AllNumbers
					GROUP BY Number
					ORDER BY Frequency DESC, Number ASC";

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text, query, null))
				{
					while (reader.Read())
					{
						Dictionary<string, object> item = new Dictionary<string, object>();
						item["NUMBER"] = reader["Number"];
						item["FREQUENCY"] = reader["Frequency"];
						frequency.Add(item);
					}
				}
			}

			return frequency;
		}

		public List<LottoInformation> GetRecentWinners(int count)
		{
			List<LottoInformation> recent = new List<LottoInformation>();

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				SqlParameter[] parameters = new SqlParameter[]
				{
					new SqlParameter("@Count", count)
				};

				string query = @"
					SELECT TOP (@Count) *
					FROM HWSY.dbo.Lotto_Information
					ORDER BY Turn DESC";

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text, query, parameters))
				{
					recent = Binder.BindToList<LottoInformation>(reader);
				}
			}

			return recent;
		}

		public List<Dictionary<string, object>> GetPositionFrequency()
		{
			List<Dictionary<string, object>> positions = new List<Dictionary<string, object>>();

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				for (int pos = 1; pos <= 6; pos++)
				{
					string columnName = $"Number{pos}";
					string query = $@"
						SELECT TOP 5 {columnName} AS Number, COUNT(*) AS Frequency
						FROM HWSY.dbo.Lotto_Information
						GROUP BY {columnName}
						ORDER BY Frequency DESC, {columnName} ASC";

					List<Dictionary<string, int>> topNumbers = new List<Dictionary<string, int>>();

					using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text, query, null))
					{
						while (reader.Read())
						{
							Dictionary<string, int> item = new Dictionary<string, int>();
							item["NUMBER"] = Convert.ToInt32(reader["Number"]);
							item["FREQUENCY"] = Convert.ToInt32(reader["Frequency"]);
							topNumbers.Add(item);
						}
					}

					Dictionary<string, object> posData = new Dictionary<string, object>();
					posData["POSITION"] = pos;
					posData["TOP_NUMBERS"] = topNumbers;
					positions.Add(posData);
				}
			}

			return positions;
		}

		public Dictionary<string, object> CheckNumberCombination(List<int> numbers)
		{
			Dictionary<string, object> result = new Dictionary<string, object>();
			result["HAS_MATCH"] = false;
			result["RANK"] = null;
			result["MATCHED_TURNS"] = new List<Dictionary<string, object>>();

			if (numbers == null || numbers.Count != 6)
			{
				return result;
			}

			using (SqlConnection connection = new SqlConnection(ConfigManager.Settings.ConnectionString))
			{
				// Get all lotto data
				string query = @"
					SELECT Turn, Date, Number1, Number2, Number3, Number4, Number5, Number6, NumberBonus, 
						   Reward1, Reward2, Reward3
					FROM HWSY.dbo.Lotto_Information
					ORDER BY Turn DESC";

				using (SqlDataReader reader = SqlHelper.ExecuteReader(connection, CommandType.Text, query, null))
				{
					List<Dictionary<string, object>> matches = new List<Dictionary<string, object>>();
					
					while (reader.Read())
					{
						// Get winning numbers
						List<int> winningNumbers = new List<int>
						{
							Convert.ToInt32(reader["Number1"]),
							Convert.ToInt32(reader["Number2"]),
							Convert.ToInt32(reader["Number3"]),
							Convert.ToInt32(reader["Number4"]),
							Convert.ToInt32(reader["Number5"]),
							Convert.ToInt32(reader["Number6"])
						};
						
						int bonusNumber = Convert.ToInt32(reader["NumberBonus"]);

						// Count matching numbers
						int matchCount = numbers.Count(n => winningNumbers.Contains(n));
						bool bonusMatch = numbers.Contains(bonusNumber);

						string rank = null;
						object reward = null;

						// 1등: 6개 숫자 모두 일치
						if (matchCount == 6)
						{
							rank = "1등";
							reward = reader["Reward1"];
						}
						// 2등: 5개 숫자 + 보너스 번호 일치
						else if (matchCount == 5 && bonusMatch)
						{
							rank = "2등";
							reward = reader["Reward2"];
						}
						// 3등: 5개 숫자 일치
						else if (matchCount == 5)
						{
							rank = "3등";
							reward = reader["Reward3"];
						}

						// If there's a match, add to results
						if (rank != null)
						{
							Dictionary<string, object> match = new Dictionary<string, object>();
							match["TURN"] = reader["Turn"];
							match["DATE"] = reader["Date"];
							match["RANK"] = rank;
							match["REWARD"] = reward;
							match["MATCH_COUNT"] = matchCount;
							match["BONUS_MATCH"] = bonusMatch;
							matches.Add(match);

							// Store highest rank
							if (result["RANK"] == null || 
								(rank == "1등") ||
								(rank == "2등" && result["RANK"].ToString() != "1등") ||
								(rank == "3등" && result["RANK"].ToString() != "1등" && result["RANK"].ToString() != "2등"))
							{
								result["RANK"] = rank;
							}
						}
					}

					if (matches.Count > 0)
					{
						result["HAS_MATCH"] = true;
						result["MATCHED_TURNS"] = matches;
					}
				}
			}

			return result;
		}
	}
}
