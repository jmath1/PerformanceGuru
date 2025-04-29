exports.config = {
  indexing: false,
  caching: false,
  batching: false,
  pagination: false,
  pooling: false,
  async: false,
};

exports.statusLog = {
  indexing: { status: "Idle", commands: [] },
  caching: { status: "Idle", commands: [] },
  batching: { status: "Idle", commands: [] },
  pagination: { status: "Idle", commands: [] },
  pooling: { status: "Idle", commands: [] },
  async: { status: "Idle", commands: [] },
};
