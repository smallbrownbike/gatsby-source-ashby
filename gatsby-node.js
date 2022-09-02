const axios = require("axios");

exports.sourceNodes = async (
  { createContentDigest, actions: { createNode } },
  options
) => {
  const { apiKey } = options;
  if (!apiKey)
    return console.error("gatsby-source-ashby: Missing options.apiKey");

  async function getJobs() {
    const requestOptions = {
      method: "POST",
      url: "https://api.ashbyhq.com/jobPosting.list",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
    };

    try {
      const {
        data: { results },
      } = await axios.request(requestOptions);
      return results;
    } catch (err) {
      console.error(`gatsby-source-ashby: ${err}`);
    }
  }

  const jobs = await getJobs();
  if (!jobs) return;
  jobs.forEach((job) => {
    const node = {
      ...job,
      parent: null,
      children: [],
      internal: {
        type: `AshbyJob`,
        contentDigest: createContentDigest(job),
      },
    };
    createNode(node);
  });
};
