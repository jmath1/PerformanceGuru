#!/bin/bash
set -euo pipefail

NAMESPACES=("default" "monitoring")

for NAMESPACE in "${NAMESPACES[@]}"; do
  echo "🧨 Deleting all resources in namespace: $NAMESPACE"
  kubectl delete all --all -n "$NAMESPACE" || true
done

echo "✅ Teardown complete."
