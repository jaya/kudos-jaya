---
title: How to Connect to Droplets with SSH
description: Use a terminal to connect to Droplets using OpenSSH or PuTTY for shell access to your remote server.
product: Droplets
url: https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/
last_updated: '2026-07-13'
---

> **For AI agents:** The documentation index is at [https://docs.digitalocean.com/llms.txt](https://docs.digitalocean.com/llms.txt). Markdown versions of pages use the same URL with `index.html.md` in place of the HTML page (for example, append `index.html.md` to the directory path instead of opening the HTML document).

# How to Connect to Droplets with SSH

DigitalOcean Droplets are Linux-based virtual machines (VMs) that run on top of virtualized hardware. Each Droplet you create is a new server you can use, either standalone or as part of a larger, cloud-based infrastructure.

You can connect to DigitalOcean Droplets using an [SSH client](https://www.digitalocean.com/community/tutorials/ssh-essentials-working-with-ssh-servers-clients-and-keys), typically from a [terminal](https://www.digitalocean.com/community/tutorials/an-introduction-to-the-linux-terminal).

To do so, you need to have an SSH client, like OpenSSH or PuTTY, and the following three pieces of information:

- **The Droplet’s IP address.**

  After your Droplet is created, its IP address is displayed in the [DigitalOcean Control Panel](https://cloud.digitalocean.com).

- **The username on the server** that you want to connect as.

  The default username on initial creation is `root` on most operating systems, like Ubuntu and CentOS. If you [add another user](https://www.digitalocean.com/community/tutorial-collections/how-to-add-and-delete-users), you can use that username instead.

- **The authentication method** for that user.

  If you [add SSH keys to your Droplet](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/index.html.md), you can connect using those keys, which we strongly recommend for its additional security. Otherwise, if you use password authentication, use the password you chose.

Once you have your Droplet’s IP address, username, and password or SSH keys, follow the instructions for your SSH client. OpenSSH is included on Linux, macOS, and Windows Subsystem for Linux. Windows users with Bash also have access to OpenSSH. Windows users without Bash can use PuTTY.

[How to Connect to your Droplet with OpenSSH](https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/openssh/index.html.md): Use a terminal on a Linux, macOS, or Windows computer to connect to Droplets with SSH.

[How to Connect to your Droplet with PuTTY on Windows](https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/putty/index.html.md): Use PuTTY on a Windows computer to connect to Droplets with SSH.

Alternatively, you can use `doctl`, the DigitalOcean command-line tool, to connect to your Droplet with SSH.

## How to Access a Droplet Using SSH Using the DigitalOcean CLI

1. [Install `doctl`](https://docs.digitalocean.com/reference/doctl/how-to/install/index.html.md), the official DigitalOcean CLI.
2. [Create a personal access token](https://docs.digitalocean.com/reference/api/create-personal-access-token/index.html.md) and save it for use with `doctl`.
3. Use the token to grant `doctl` access to your DigitalOcean account.```shell
   doctl auth init
   ```

   ```
4. Finally, run `doctl compute ssh`. Basic usage looks like this, but you can [read the usage docs](https://docs.digitalocean.com/reference/doctl/reference/compute/ssh/index.html.md) for more details:```shell
   doctl compute ssh <droplet-id|name> [flags]
   ```

   ```

[Private Droplets](https://docs.digitalocean.com/products/droplets/details/private-droplets/index.html.md) have no public IP address and require a separate connection pattern using SSH `ProxyJump` through a bastion host.

[How to Connect to a Private Droplet](https://docs.digitalocean.com/products/droplets/how-to/connect-private-droplet/index.html.md): Connect to Private Droplets over SSH through a bastion host in the same VPC or a peered VPC.
