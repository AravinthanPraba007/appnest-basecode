const onSubmissionComplete = async ({ payload }) => {
  console.log('Submission completed with data:', payload);
  return {
    responseCode: 200,
    responseBody: {
      message: 'Submission complete event handled successfully',
    },
  };
};

const onContactCreate = async ({ payload }) => {
  console.log('Contact created with data:', payload);
  return {
    responseCode: 200,
    responseBody: {
      message: 'Contact create event handled successfully',
    },
  };
};

module.exports = { onSubmissionComplete, onContactCreate };

