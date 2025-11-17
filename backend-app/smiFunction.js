const function1 = () => {
    console.log("function1 is invoked");
    return {
    responseCode: 200,
    responseBody: {
      message: 'function1 handled successfully',
    }
  }
};

const function2 = () => {
    console.log("function2 is invoked");
    return {
    responseCode: 200,
    responseBody: {
      message: 'function2 handled successfully',
    }
  }
};

module.exports = { function1, function2 };