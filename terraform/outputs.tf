output "public_ip" {
  value = aws_instance.app.public_ip
}

output "site_url" {
  value = "https://${replace(aws_instance.app.public_ip, ".", "-")}.sslip.io"
}

output "ssh_command" {
  value = "ssh -i $env:USERPROFILE\\.ssh\\pulsefit-key.pem ubuntu@${aws_instance.app.public_ip}"
}