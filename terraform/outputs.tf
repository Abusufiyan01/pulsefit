output "public_ip" {
  value = aws_instance.app.public_ip
}

output "site_url" {
  value = "http://${aws_instance.app.public_ip}"
}

output "ssh_command" {
  value = "ssh -i $env:USERPROFILE\\.ssh\\pulsefit-key.pem ubuntu@${aws_instance.app.public_ip}"
}