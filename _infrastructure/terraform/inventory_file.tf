resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/inventory.ini"
  content  = <<-EOT
  [control_plane]
  ${aws_instance.k8s_control_plane.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

  [workers]
  ${aws_instance.k8s_worker[0].public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
  ${aws_instance.k8s_worker[1].public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

  [all:vars]
  control_plane_api_server_address=https://${aws_instance.k8s_control_plane.public_ip}:6443
  EOT

  lifecycle {
    replace_triggered_by = [
    aws_instance.k8s_control_plane,
    aws_instance.k8s_worker[0],
    aws_instance.k8s_worker[1],
    ]
  }
}