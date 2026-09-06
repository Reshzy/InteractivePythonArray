import { COMPARISONS, type ComparisonLesson } from "@/data/comparisons";
import {
  METHODS,
  type MethodDefinition,
} from "@/data/methods";

export type LearningSearchResult = {
  methods: MethodDefinition[];
  comparisons: ComparisonLesson[];
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function methodMatches(method: MethodDefinition, query: string): boolean {
  const haystacks = [
    method.id,
    method.label,
    method.syntax,
    method.shortDescription,
    method.explanation,
    ...(method.comparisonWith ?? []),
    ...(method.commonMistakes ?? []),
  ];

  return haystacks.some((text) => text.toLowerCase().includes(query));
}

function comparisonMatches(comparison: ComparisonLesson, query: string): boolean {
  const haystacks = [
    comparison.id,
    comparison.summary,
    comparison.left.title,
    comparison.right.title,
    ...comparison.searchTerms,
    ...comparison.teachingPoints,
  ];

  return haystacks.some((text) => text.toLowerCase().includes(query));
}

export function searchLearningContent(query: string): LearningSearchResult {
  const normalized = normalizeQuery(query);
  if (normalized === "") {
    return {
      methods: [...METHODS],
      comparisons: [...COMPARISONS],
    };
  }

  const directMethods = METHODS.filter((method) =>
    methodMatches(method, normalized),
  );
  const methodIds = new Set(directMethods.map((method) => method.id));

  for (const method of directMethods) {
    for (const related of method.comparisonWith ?? []) {
      const relatedMethod = METHODS.find((item) => item.id === related);
      if (relatedMethod) {
        methodIds.add(relatedMethod.id);
      }
    }
  }

  for (const method of METHODS) {
    if (method.comparisonWith?.some((related) => methodIds.has(related as typeof method.id))) {
      methodIds.add(method.id);
    }
  }

  const comparisons = COMPARISONS.filter((comparison) => {
    if (comparisonMatches(comparison, normalized)) {
      return true;
    }

    return (
      (comparison.left.tryMethod !== undefined &&
        methodIds.has(comparison.left.tryMethod)) ||
      (comparison.right.tryMethod !== undefined &&
        methodIds.has(comparison.right.tryMethod))
    );
  });

  for (const comparison of comparisons) {
    if (comparison.left.tryMethod) {
      methodIds.add(comparison.left.tryMethod);
    }
    if (comparison.right.tryMethod) {
      methodIds.add(comparison.right.tryMethod);
    }
  }

  return {
    methods: METHODS.filter((method) => methodIds.has(method.id)),
    comparisons,
  };
}
