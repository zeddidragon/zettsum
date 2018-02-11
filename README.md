# zettsum
> Generate checksums line-by-line for strings and buffer.

## Installation
Ensure you have [Node.js](https://nodejs.org) version 6 or higher installed. Then run the following:

```js
    npm install --global zettsum
```

## Usage

```sh
    $ zettsum --help

    Usage
        zettsum [OPTIONS]... [STRINGS]...


    Examples
        $ zettsum hello world
        2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7

        $ cat example-file | zettsum -a md5 -i
        a31c1ee99c9fe959d53e9451fda25698	First line of file
        a61f9d7e47241495f7ccc6e552cbced2	Second line of file
        742bf73e9b812f5e6faa9697c707ec44	Third and final line

    If no STRINGS are provided, streams standard input.

      -a {a}, --algo {a}      set hashing algorithm to {a}, default is sha256
                              options: see -A

      -H, --hashes            display all available hashing algorithms and exit

      -d {f}, --digest {f}    set digest format to {f}, default is hex
                              options: hex, latin1, base64

      -i, --input             print input along with hash, seperated by tab
                              900150983cd24fb0d6963f7d28e17f72	abc

      -e {f}, --encoding {f}  set encoding to {f}, default is utf8
                              options: utf8, ascii, latin1

      -h, --help              display this help and exit

      -v, --version           display version information and exit


    Generates checksums for each STRING or stdin line individually.
    Node's crypto module is used:  https://nodejs.org/api/crypto.html
```

## License
```
               DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                       Version 2, December 2004

    Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

    Everyone is permitted to copy and distribute verbatim or modified
    copies of this license document, and changing it is allowed as long
    as the name is changed.

               DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
      TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

     0. You just DO WHAT THE FUCK YOU WANT TO.
```
