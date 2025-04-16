using System.Reflection;
using Microsoft.Data.SqlClient;

namespace YL.Models.Functions
{
	internal class Binder
	{
		public static List<T> BindToList<T>(SqlDataReader sqlDataReader)
		{
			List<T> list = new List<T>();
			T obj = default(T);

			while(sqlDataReader.Read())
			{
				obj = Activator.CreateInstance<T>();

				for (int i = 0; i < sqlDataReader.FieldCount; i++)
				{
					string camelString = StringUtility.ConvertCamelCase(sqlDataReader.GetName(i));
					PropertyInfo prop = obj.GetType().GetProperty(camelString);

					if (object.Equals(sqlDataReader[i], DBNull.Value))
					{
						prop.SetValue(obj, null, null);
					}
					else
					{
						prop.SetValue(obj, sqlDataReader[sqlDataReader.GetName(i)], null);
					}
				}

				list.Add(obj);
			}

			return list;
		}

		public static object BindToModel(SqlDataReader sqlDataReader, object model)
		{
			for (int i = 0; i < sqlDataReader.FieldCount; i++)
			{
				string camelString = StringUtility.ConvertCamelCase(sqlDataReader.GetName(i));
				PropertyInfo prop = model.GetType().GetProperty(camelString);

				if (object.Equals(sqlDataReader[i], DBNull.Value))
				{
					prop.SetValue(model, null, null);
				}
				else
				{
					prop.SetValue(model, sqlDataReader[sqlDataReader.GetName(i)], null);
				}
			}

			return model;
		}

		public static List<string> BindToStringList(SqlDataReader sqlDataReader)
		{
			List<string> list = new List<string>();

			while(sqlDataReader.Read())
			{
				list.Add(sqlDataReader.GetString(0));
			}

			return list;
		}
	}
}
