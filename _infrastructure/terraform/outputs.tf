output "control_plane_public_ip" {
  description = "Public IP of control plane"
  value       = aws_instance.k8s_control_plane.public_ip
}

output "worker_public_ips" {
  description = "Public IPs of worker nodes"
  value       = aws_instance.k8s_worker[*].public_ip
}