# Welcome to the Redux General Store!

We all love redux, sure, but we all know it has one tiny flaw, which is the
amount of boilerplate necessary to get the redux store up and running. Well no
more!

The Redux General Store generalizes thunks and reducers so that one set of
thunks can serve any model, and reducers are generated for each model
automatically. The trade-off is more opinionation: you must specify which model
and route to use when calling the thunk.

For example:

    getUsers()

becomes:

    genericGet('/api/', 'users')

In this example , both strings passed in should be substituted with constants to
guard against typo bugs. That turns it into:

    genericGet(api, users)

Yes, I know, it is slightly more 'wordy' than the original line, but in exchange
for typing few more characters, you get a redux store that handles basic CRUD
operations, is about 10 lines long, and doesn't get larger with more models.
Adding a new slice of data to your store is as easy as adding the name of the
model to the 'models' array and that's it.

A small React application using The General General Store can be found here:
https://github.com/LLLisa/RGSTest

!important: This is not intended as a complete replacement for all redux
functionality. For instance, the thunks provided by the general store can only
GET all instances of a model. It does not GET all instances WHERE a condition is
met (well, it can, but you probably shouldn't bother). Also, no consideration is
given to security here. You are expected to take care of these sorts of
situations in your REST API routes and/or by building your own thunks and
reducers to cover them. The Redux General Store is intended for general,
non-secure CRUD operations between your frontend and your API.

So let's get started!

## Getting Started

First, do the old

    $ npm install redux-general-store --save-dev

then

    import GeneralStore from 'redux-general-store'

What you have just imported is the GeneralStore class. Create an instance of it
and pass in the base URL of your API as the first argument, and an array
containing the names of the models (or slices if you prefer) you will be using
the general store for as the second argument. It will look something like this:

    export const GS = new GeneralStore('http://localhost:42069', [ 'users', 'accounts', 'files', ]);

You can put the export statement elsewhere if you wish. When the GS object is
created, it will automatically construct a full CRUD reducer for each of the
models passed in the second argument.

## The GS Object

### Properties

The GS object is returned when you create an instance of the GeneralStore class
using the `new` keyword. It has three(3) properties:

- `GS.baseUrl`

(String) This is the base url to your api. Something like
`http://localhost:42069` or `www.fsf.org` or something. The actual api route
will be appended to this url.

- `GS.models`

(Array) This is the array of models you passed in when the GS object was
created. This is used to create reducers for each model and is useful wherever
you need a list of all of the models handled by The Redux General Store.

- `GS.reducerBody`

(Object) This is where things start getting good. This object contains all of
the reducers generated when the GS object is created. This is passed directly
into the redux `combineReducers` function like so:

    const reducer = combineReducers({ GS.reducerBody})

If adding more reducers besides the ones generated by the GS object, use the
spread operator like so:

```
const reducer = combineReducers({
  /**place non-general reducers here */ ...GS.reducerBody,
});
```

The default state for all GS reducers is an empty array.

### CRUD Methods

There are 4 CRUD methods on the GS object:

- `GS.genericGet(route, model)`

This method is will attempt to use an HTTP GET route on a model (or table or
slice), returning all rows from the specified table It expects to receive an
array as a response.. These api route urls typically look something like this:

    http://localhost:42069/api/users

and this is constructed when `genericGet` is called: The baseUrl is the same as
the one passed in when the GS object is created, the route (`/api` in our
example) and the model (`users`) are passed in when calling the method. The api
route is constructed like this:

    ${this.baseUrl}${route}/${model}

The model argument is kept separate from the rest of the url here because it is
also used to dispatch the result of the api call to the reducer for that model.
Neat!

- `GS.genericPost(route, model, data)`

This method will attempt to add a row (or instance) to a database table using an
HTTP POST route and expects to receive the created item as a response. The route
and model arguments are the same as in the previous method, and the data object
here must be an object. It should look something like this:

```
  {
    firstName: 'Homer',
    lastName: 'Simpson',
    email: 'chunkylover53@aol.com'
  }
```

The data is intended to be inserted into the proper table (model) with the
column names matching the keys on the data object. Server-side and database
validation errors are not handled by The Redux General Store and should be
processed separately.

- GS.genericPut(route, model, data, identifier(optional))

This method will attempt to send an HTTP PUT request to the server with the
intention of updating a particular row in a database and expects to receive the
updated item as a response. The route and model arguments are the same as in the
previous methods, but the data object only needs to contain the data to update
on the intended row. The optional identifier argument is an object used to
identify which row in the database to update. For example:

```
GS.genericPut(api, users, {jobTitle: Snow Plow Driver}, {firstName:Homer})
```

This will find the proper row by using the identifier object as a search
parameter and update the information accordingly. An easier way to do this is to
simply pass the entire updated data object like so:

```
GS.genericPut(api, users, updatedData)
```

or

```
GS.genericPut(api, users, { ...selectedUser, ...newInfo })
```

By default, if an identifier is not provided, the genericPut thunk will look on
the data object for a property called 'id' and use that as an identifier. The
`req.body` generated by this thunk will always be an object in the shape of
`req.body: {data, identifier}`

- GS.genericDelete(route, model, identifier)

This one is just like it says on the tin. It will attempt to send an HTTP DELETE
request to the provided url and expects to receive the deleted item as a
response. The identifier argument must be an object in the form:

    {id:4}

..and that's it for the CRUD methods!

### Additional Methods

There are two utility methods on the GS object. It is probably best to ignore
them both, but I believe there are use cases in which one might wnat to use
them.

- GS.generateReducer(model)

This method returns a reducer function with Get, Post, Put, and Delete
functionality for the specified model. It looks like this:

```
generateReducer = (model) => {
    return (state = [], action) => {
      if (action.type === `GET_${model}`) return action.payload;
      if (action.type === `POST_${model}`) return [...state, action.payload];
      if (action.type === `PUT_${model}`)
        return state.map((x) =>
          x.id === action.payload.id ? action.payload : x
        );
      if (action.type === `DELETE_${model}`)
        return state.filter((x) => x.id !== action.payload.id);
      return state;
    };
  };

```

Note that the action.types here don't follow the typical naming convention;
instead of `GET_USERS` we use `GET_users`. This allows us to use the same
variable to build the api url as we use to dispatch state changes. Pretty cool,
huh?

Also note that every generic reducer returns an empty array by default.

This method will be useful if you want to generate a one-off generic reducer for
a particular model. Just

    const stoneCutterReducer = GS.generateReducer(stoneCutters)

...then add it to the `combineReducers` function provided by redux.

    const reducer = combineReducers({stoneCutterReducer, ...GS.reducerBody})

- GS.generateReducerBody(models)

This method is used when the GS object is created. It calls `generateReducer` on
each model that was passed in when the GS object was created and returns an
object which is a collection of those reducers. It is typically passed into the
redux `combineReducers` function like so:

    const reducer = combineReducers({ GS.reducerBody})

## Typical API Routes

Here is a typical GET route that returns all rows of a given table:

```
app.get('/api/:model', async (req, res, next) => {
  try {
    let tableName = req.params.model;
    const regExp = /[A-Z]/;
    if (regExp.test(tableName)) tableName = `"${tableName}"`;
    const response = await db.query(`SELECT * FROM ${tableName} ;`);
    res.send(response[0]);
  } catch (error) {
    next(error);
  }
});
```

This route is used to retrieve data from tables whose names are passed in
through `req.params.model`. We are accessing a postgresql database. This
requires us to either only have table names with all lowercase letters _or_
account for this by surrounding thos table names with quotes. We have also opted
for a raw SQL query instead of using the sequelize `Model.findall()` method
because in order to transmute the model names passed in into their singular,
uppercased forms is harder than just using a regex test and a raw `db.query()`.
This method follows the generic style of The Redux General Store, but it's
veering sharply away from the RESTful API paradigm, which is not necessary to do
at all.

You can (and probably should) write traditional RESTful API routes like this:

```
app.put('/api/users', async (req, res, next) => {
  try {
    const userToUpdate = await User.findByPk(req.body.identifier.id);
    const data = req.body.data;
    const response = await userToUpdate.update(data);
    res.send(response);
  } catch (error) {
    next(error);
  }
});
```

The Redux General Store passes the identifier (here, the Primary Key) and the
updated data as separate objects in a PUT route. They are accessed via
`req.body.data` and `req.body.identifier`.

And just to round out our CRUD suite:

```
app.post('/api/users', async (req, res, next) => {
  try {
    const data = req.body;
    const response = await User.create(data);
    res.send(response);
  } catch (error) {
    next(error);
  }
});
```

```
app.delete('/api/users', async (req, res, next) => {
  try {
    const doomedUser = await User.findByPk(req.body.id);
    await doomedUser.destroy();
    res.send(doomedUser);
  } catch (error) {
    next(error);
  }
});
```

## React Implementation
