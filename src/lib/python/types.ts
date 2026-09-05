export type PythonValue =
  | {
      type: "string";
      value: string;
    }
  | {
      type: "number";
      value: number;
    }
  | {
      type: "boolean";
      value: boolean;
    }
  | {
      type: "none";
      value: null;
    };

export type ListItem = {
  id: string;
  value: PythonValue;
};

export type MethodId =
  | "len"
  | "append"
  | "clear"
  | "copy"
  | "count"
  | "extend"
  | "index"
  | "insert"
  | "pop"
  | "remove"
  | "reverse"
  | "sort"
  | "sorted";

export type PlaygroundErrorType = "ValueError" | "IndexError" | "TypeError";

export type PlaygroundError = {
  type: PlaygroundErrorType;
  message: string;
  friendlyMessage: string;
};

export type AnimationInstruction =
  | {
      type: "append";
      addedIndex: number;
    }
  | {
      type: "insert";
      insertedIndex: number;
      shiftedIndices: number[];
    }
  | {
      type: "remove";
      removedIndex: number;
      scannedIndices: number[];
    }
  | {
      type: "pop";
      removedIndex: number;
    }
  | {
      type: "clear";
      removedIndices: number[];
    }
  | {
      type: "reverse";
    }
  | {
      type: "sort";
      previousOrder: string[];
      nextOrder: string[];
    }
  | {
      type: "scan";
      scannedIndices: number[];
      matchedIndices: number[];
    }
  | {
      type: "copy";
    }
  | {
      type: "extend";
      addedIndices: number[];
    }
  | {
      type: "none";
    };

type OperationBase = {
  list: ListItem[];
  variableName?: string;
};

export type OperationRequest =
  | (OperationBase & {
      method: "len";
    })
  | (OperationBase & {
      method: "append";
      args: {
        value: PythonValue;
      };
    })
  | (OperationBase & {
      method: "clear";
    })
  | (OperationBase & {
      method: "copy";
    })
  | (OperationBase & {
      method: "count";
      args: {
        value: PythonValue;
      };
    })
  | (OperationBase & {
      method: "extend";
      args: {
        values: PythonValue[];
      };
    })
  | (OperationBase & {
      method: "index";
      args: {
        value: PythonValue;
      };
    })
  | (OperationBase & {
      method: "insert";
      args: {
        index: number;
        value: PythonValue;
      };
    })
  | (OperationBase & {
      method: "pop";
      args?: {
        index?: number;
      };
    })
  | (OperationBase & {
      method: "remove";
      args: {
        value: PythonValue;
      };
    })
  | (OperationBase & {
      method: "reverse";
    })
  | (OperationBase & {
      method: "sort";
      args?: {
        reverse?: boolean;
      };
    })
  | (OperationBase & {
      method: "sorted";
      args?: {
        reverse?: boolean;
      };
    });

export type OperationResult = {
  before: ListItem[];
  after: ListItem[];
  mutates: boolean;
  returnValue?: PythonValue | ListItem[];
  error?: PlaygroundError;
  code: string;
  explanation: string;
  animation: AnimationInstruction;
};
