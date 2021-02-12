/* Import faunaDB sdk */
const faunadb = require("faunadb");
const q = faunadb.query;

/* export our lambda function as named "handler" export */
exports.handler = async (event, context) => {
  /* configure faunaDB Client with our secret */
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET,
  });

  console.log("Eventtttt", event);
  /* parse the string body into a useable JS object */
  const obj = JSON.parse(event.body);
  const category = obj.category;
  const email = obj.email;
  const foodId = obj.foodId;
  const originFoodIds = obj.originFoodIds;
  const icon = obj.icon;

  console.log("Function `updateNewFood` invoked", category);
  console.log("origin", originFoodIds)
  console.log({icon})
  /* construct the fauna query */
  /* 
  foodname : 
  
  {
    placeIds: [],
    icon: ""
  }

  */
  return client
    .query(
      q.Update(
        q.Select(["ref"], q.Get(q.Match(q.Index("FoodList_Id"), email))),
        {
          data: { foodList: { [category]: { placeIds: [ ...originFoodIds, foodId ], icon } } },
        }
      )
    )
    .then((response) => {
      console.log("success", response);
      /* Success! return the response with statusCode 200 */
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    })
    .catch((error) => {
      console.log("error", error);
      /* Error! return the error with statusCode 400 */
      return {
        statusCode: 400,
        body: JSON.stringify(event),
      };
    });
};
