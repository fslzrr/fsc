export type MemoryMap = {
  Global: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
  };
  Function: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
  };
  Constant: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
  };
  Temporal: {
    Int: number;
    Boolean: number;
    Float: number;
    String: number;
  };
};

const memoryMap: MemoryMap = {
  Global: {
    Int: 5000,
    Boolean: 6000,
    Float: 7000,
    String: 8000,
  },
  Function: {
    Int: 9000,
    Boolean: 10000,
    Float: 11000,
    String: 12000,
  },
  Constant: {
    Int: 13000,
    Boolean: 14000,
    Float: 15000,
    String: 16000,
  },
  Temporal: {
    Int: 17000,
    Boolean: 18000,
    Float: 19000,
    String: 20000,
  },
} as const;

export default memoryMap;
