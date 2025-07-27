# Test Assignment 2025

Author: Dmytro Rekechynskyi

## Steps to proceed

1. Make sure Docker is installed (keep in mind Docker Compose v2 syntax is used)
2. The `andriiuni/events` image supports only linux/arm64/v8 CPU architecture.
   If your computer has this architecture, you don't need to do anything. Otherwise,
   proceed with these steps:
   * Make sure QEMU is installed with ARM emulation. You may check this via running
     `qemu-system-aarch64` command
   * (For Linux) Make sure `binfmt_misc` kernel module is enabled. You may check it
     via running `cat /proc/sys/fs/binfmt_misc/status` command, it should show
     `enabled`. If it's not the case, run the `sudo modprobe binfmt_misc` command
     and wait for around 5 minutes for this command to take effect.
   * Run the command to support linux/arm64/v8 CPU architecture:
     ```sh
     docker run --privileged --rm tonistiigi/binfmt --install all
     ```
3. Create an `.env` file with proper values. Example may be seen in `.development.env`
4. Run this command to build and launch this ecosystem:
   ```sh
   docker compose up --build
   ```

That's it!
