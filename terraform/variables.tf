variable "region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_name" {
  description = "Name of the existing EC2 key pair used for SSH"
  type        = string
  default     = "pulsefit-key"
}

variable "my_ip_cidr" {
  description = "Your public IP in CIDR form, for example 203.0.113.5/32"
  type        = string
}