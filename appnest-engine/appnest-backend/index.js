exports.handler = async (event, context) => {
  console.log('Event:', event);
  console.log('Context:', context);

  const parentLayer = event.body && JSON.parse(event.body);
  const eventPayloadConfig =
    parentLayer?.appConfig?.extraPayload?.parentLayerConfigObject;
  const fileName = `../../backend-app/server.js`;
  const appServer = require(fileName);
  const data1 = await appServer[eventPayloadConfig.event]();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Lambda!!!' }),
  };
};
