export type MemoryMap = {
  Global: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
    List: number;
  };
  Function: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
    List: number;
  };
  Constant: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
    List: number;
  };
  GlobalTemporal: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
    List: number;
  };
  FunctionTemporal: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
    List: number;
  };
};

const memoryMap: MemoryMap = {
  Global: {
    Int: 5000,
    Boolean: 6000,
    Float: 7000,
    String: 8000,
    List: 9000,
  },
  Constant: {
    Int: 10000,
    Boolean: 11000,
    Float: 12000,
    String: 13000,
    List: 14000,
  },
  GlobalTemporal: {
    Int: 15000,
    Boolean: 16000,
    Float: 17000,
    String: 18000,
    List: 19000,
  },
  Function: {
    Int: 20000,
    Boolean: 21000,
    Float: 22000,
    String: 23000,
    List: 24000,
  },
  FunctionTemporal: {
    Int: 25000,
    Boolean: 26000,
    Float: 27000,
    String: 28000,
    List: 29000,
  },
} as const;

export default memoryMap;
