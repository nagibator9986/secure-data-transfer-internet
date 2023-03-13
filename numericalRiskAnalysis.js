
    await new Promise((resolve, reject) => {
      const messageHandler = message => {
        if (message.attributes && message.attributes.DlpJobName === jobName) {
          message.ack();
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          resolve(jobName);
        } else {
          message.nack();
        }
      };

      const errorHandler = err => {
        subscription.removeListener('message', messageHandler);
        subscription.removeListener('error', errorHandler);
        reject(err);
      };

      subscription.on('message', messageHandler);
      subscription.on('error', errorHandler);
    });
    setTimeout(() => {
      console.log(' Waiting for DLP job to fully complete');
    }, 500);
    const [job] = await dlp.getDlpJob({name: jobName});
    const results = job.riskDetails.numericalStatsResult;

    console.log(
      `Value Range: [${getValue(results.minValue)}, ${getValue(
        results.maxValue
      )}]`
    );

    // Печатаем уникальные значения квантилей
    let tempValue = null;
    results.quantileValues.forEach((result, percent) => {
      const value = getValue(result);

     // Печатать только новые значения
      if (
        tempValue !== value &&
        !(tempValue && tempValue.equals && tempValue.equals(value))
      ) {
        console.log(`Value at ${percent}% quantile: ${value}`);
        tempValue = value;
      }
    });
  }

  numericalRiskAnalysis();
  // [END dlp_numerical_stats]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
