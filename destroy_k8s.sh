#!/bin/bash
set -euo pipefail

NAMESPACE=default

echo "🧨 Deleting all Kubernetes resources in namespace: $NAMESPACE"
kubectl delete all --all -n "$NAMESPACE"

echo "🧨 Deleting all PVCs"
kubectl delete pvc --all -n "$NAMESPACE"

echo "🧨 Deleting all PVs"
kubectl delete pv --all

echo "🧨 Deleting all StorageClasses"
kubectl delete storageclass --all || true


# echo "🔍 Finding available EBS volumes created by Kubernetes..."
# VOLUMES=$(aws ec2 describe-volumes --query "Volumes[].VolumeId" --output text)

# if [ -n "$VOLUMES" ]; then
#   echo "Detaching volume IDs: $VOLUMES"
#   for volume_id in $VOLUMES; do
#     echo "🔌 Detaching volume $volume_id (if attached)..."
#     aws ec2 detach-volume --volume-id "$volume_id" || true

#     echo "⏳ Waiting for $volume_id to be detached..."
#     aws ec2 wait volume-available --volume-ids "$volume_id"

#     echo "💣 Deleting volume $volume_id..."
#     aws ec2 delete-volume --volume-id "$volume_id" || true
#   done
#   echo "💣 Deleting orphaned EBS volumes: $VOLUMES"
#   for volume_id in $VOLUMES; do
#     aws ec2 delete-volume --volume-id "$volume_id"
#   done
# else
#   echo "✅ No orphaned EBS volumes to delete."
# fi

echo "✅ Teardown complete."
