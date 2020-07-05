This project is a part of FCC Activity Tracker.
Uer can create a username and UserId. He can then use the ID to create an activity.
/api/exercise/users, will provide all the database of saved users.
/api/exercise/log?userId=""&from=""&to=""&limit="", App will return the user object with added array log and count (total exercise count).
I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)

Technology Used: NodeJs, Mongoose, MongoDB, Express