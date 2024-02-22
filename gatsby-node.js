const axios = require("axios");

exports.sourceNodes = async (
  { createContentDigest, actions: { createNode } },
  options
) => {
  const { apiKey, listedOnly = true } = options;
  if (!apiKey)
    return console.error("gatsby-source-ashby: Missing options.apiKey");

  async function request(url, options) {
    const requestOptions = {
      method: "POST",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
    };
    if (options) requestOptions.data = JSON.stringify(options);
    try {
      const {
        data: { results },
      } = await axios.request(requestOptions);
      return results;
    } catch (err) {
      console.error(`gatsby-source-ashby: ${err}`);
    }
  }

  async function getJobPostings({ listedOnly }) {
    return request("https://api.ashbyhq.com/jobPosting.list", { listedOnly });
  }

  async function getJobPostingInfo(id) {
    return request("https://api.ashbyhq.com/jobPosting.info", {
      jobPostingId: id,
    });
  }

  async function getCustomFields() {
    return request("https://api.ashbyhq.com/customField.list");
  }

  async function getJobs() {
    return request("https://api.ashbyhq.com/job.list");
  }

  const customFields = await getCustomFields();

  customFields.forEach((customField) => {
    const node = {
      ...customField,
      parent: null,
      children: [],
      internal: {
        type: `AshbyCustomField`,
        contentDigest: createContentDigest(customField),
      },
    };
    createNode(node);
  });

  const jobs = await getJobs();
  for (const job of jobs) {
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
  }

  const jobPostings = await getJobPostings({
    listedOnly,
  });

  for (const jobPosting of jobPostings) {
    const jobPostingInfo = await getJobPostingInfo(jobPosting.id);
    jobPosting.info = jobPostingInfo;
    const jobPostingNode = {
      ...jobPosting,
      parent: jobPosting.jobId,
      children: [],
      internal: {
        type: `AshbyJobPosting`,
        contentDigest: createContentDigest(jobPosting),
      },
    };
    createNode(jobPostingNode);
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes, createFieldExtension } = actions;

  createFieldExtension({
    name: "customFieldValue",
    extend: () => ({
      async resolve(source, _args, context) {
        const data = await context.nodeModel.getNodeById({
          type: "AshbyCustomField",
          id: source.id,
        });
        if (Array.isArray(source.value)) {
          const value = source.value.map(
            (sourceValue) =>
              data?.selectableValues?.find(({ value }) => value === sourceValue)
                ?.label || sourceValue
          );
          return JSON.stringify(value);
        }
        const value =
          data?.selectableValues?.find(({ value }) => {
            return value === source.value;
          })?.label || source.value;
        return value;
      },
    }),
  });

  const typeDefs = `
      type AshbyJobCustomFields {
        value: String @customFieldValue
      }
    `;
  createTypes(typeDefs);
};
