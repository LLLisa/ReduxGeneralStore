class GeneralStore {
  constructor(baseUrl, models) {
    this.baseUrl = baseUrl;
    this.models = models;
    this.reducerBody = this.generateReducerBody(this.models);
  }

  generateReducer = (slice) => {
    return (state = [], action) => {
      if (action.type === `LOAD_${slice}`) return action.payload;
      return state;
    };
  };

  generateReducerBody = (models) => {
    return models.reduce((body, model) => {
      body[model] = this.generateReducer(model);
      return body;
    }, {});
  };
}

GeneralStore.prototype.gReducer = (slice) => {
  return (state = [], action) => {
    if (action.type === `LOAD_${slice}`) return action.payload;
    return state;
  };
};

module.exports = GeneralStore;
// export
