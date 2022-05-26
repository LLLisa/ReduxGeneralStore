# Welcome to the Redux General Store!

We all love redux, sure, but we all know it has one tiny flaw, which is the
amount of boilerplate necessary to get the redux store to be functional. Well no
more!

The Redux General Store generalizes thunks and reducers so that one thunk can
serve any model, and reducers are generated for each model automatically. The
trade-off is that you must specify which model and route to use when calling the
thunk.

For example:

    getUsers()

becomes:

    genericGet('/api/', 'users')

In this example , both strings passed in should be substituted with constants to
guard against typo bugs. That turns it into:

    genericGet(api, users)

Yes, I know, it is slightly more 'wordy' than the original line, but in exchange
for typing few more characters, you get a redux store that is about 10 lines
long and provides thunks and reducers that handle all CRUD operations.

!important: This is not intended as a complete replacement for all redux stores.
The thunks provided by the general store can only GET all instances of a model.
It does not GET all instances WHERE a condition is met (well, it can, but you
probably shouldn't bother). Also, no consideration is given to security here.
You are expected to take care of these situations in your REST API routes and/or
by building your own thunks and reducers to cover them. The Redux General Store
(tm) is intended for general, non-secure CRUD operations between your frontend
and your API.

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

You can export it elsewhere if you wish. When the GS object is created, it will
automatically construct a full CRUD reducer for each of the models passed in the
second argument.

(it looks like this if you're interested)

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
