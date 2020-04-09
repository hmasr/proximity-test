# [1.1.0](https://github.com/ovaar/node-pi-proximity/compare/v1.0.0...v1.1.0) (2020-04-08)


### Features

* **Signal:** Add value to change event ([59f2f0a](https://github.com/ovaar/node-pi-proximity/commit/59f2f0a380f96b7d4958dfa402df1e3973d799aa))

# 1.0.0 (2019-12-31)


### Bug Fixes

* **Bluetooth:** Change inquire to async ([a68ff98](https://github.com/ovaar/node-pi-proximity/commit/a68ff98ed63b40766dec20459188de842abb359a))
* **Bluetooth:** Rename class Bluetooth to BluetoothProximity ([be51d6a](https://github.com/ovaar/node-pi-proximity/commit/be51d6ade8dc45dbab36398b16c2a9b5c6ee27b6))
* **bluetooth.ts:** Change import path to '@abandonware/noble' ([6dcf3af](https://github.com/ovaar/node-pi-proximity/commit/6dcf3af3e0e952115b062fb4e4df323460321304))
* **Gpio:** Change restarting timer to only starting when the signal is low ([70faaec](https://github.com/ovaar/node-pi-proximity/commit/70faaecb4d88e41e159eb81f6f2850fb7b356230))
* **Gpio:** Remove namespace declaration ([cdaa936](https://github.com/ovaar/node-pi-proximity/commit/cdaa9363efd1d1baa7887edde3de44e653a8e5ae))
* **Gpio:** Reset timer on every change ([3f46355](https://github.com/ovaar/node-pi-proximity/commit/3f463551f5566182b78e05e98cc01946b6b3db01))
* **launch.json:** Remove noble env entries ([9c3ee49](https://github.com/ovaar/node-pi-proximity/commit/9c3ee49f4bb47444fd5fbdd715898cf82b70e31b))
* **Progam:** uncomment import GPIO ([71b5465](https://github.com/ovaar/node-pi-proximity/commit/71b5465029374eabf64773c65f23d21d6895f059))
* **proximity:** configure Gpio ([6b38dc8](https://github.com/ovaar/node-pi-proximity/commit/6b38dc8277ca95bcecf1cad39957fa226584fd0c))
* **proximity:** configure Gpio as both ([1e88cd0](https://github.com/ovaar/node-pi-proximity/commit/1e88cd06ec8f562768dbb3abc3d8ab7128f01ab9))
* **Proximity:** Clean index.ts ([2d329d1](https://github.com/ovaar/node-pi-proximity/commit/2d329d125ab32e66c73e9eba97c5fb7d95ec95c3))
* **Signal:** Rename Gpio to Signal ([943858b](https://github.com/ovaar/node-pi-proximity/commit/943858b9e18c154618efb41b6a082ea08464df84))


### Features

* **Bluetooth:** Add Bluetooth device discovery ([5fb08d8](https://github.com/ovaar/node-pi-proximity/commit/5fb08d82a7a5adc820fad21b69efde97f5be5744))
* **Bluetooth:** Replace node-bluetooth with bluetooth-serial-port ([ca0ef8f](https://github.com/ovaar/node-pi-proximity/commit/ca0ef8faf4bf07792049675f11496718f8576e9b))
* **CI:** Add travis build and semantic-release ([86e0c4b](https://github.com/ovaar/node-pi-proximity/commit/86e0c4bad1e6030265115384e9f0a0e647580de3))
* **Gpio:** Add begin and end of signal events ([4db76c8](https://github.com/ovaar/node-pi-proximity/commit/4db76c852d34827c5a0ae4bbc5f4d7682363603d))
* **Gpio:** Add dotenv config for Signal timeout ([ee9432d](https://github.com/ovaar/node-pi-proximity/commit/ee9432dcfecf38922e8073a813e156dccd892dca))
* **Gpio:** Add Gpio Proximity class ([a45095c](https://github.com/ovaar/node-pi-proximity/commit/a45095ccf44031d7a6cddeb6f5cb054c54e2badc))
* **Gpio:** Add replace console.log with debug ([4a9d3cd](https://github.com/ovaar/node-pi-proximity/commit/4a9d3cd19ce024d3310d8867f124575d7747b276))
* **Program:** Add vcgencmd to SignalProximity callbacks ([b5775c0](https://github.com/ovaar/node-pi-proximity/commit/b5775c00865ba8f104ce35659feab480c4d191ab))
* **Proximity:** Add bluetooth class ([f12e729](https://github.com/ovaar/node-pi-proximity/commit/f12e7297745b0d5796ab5e26f99c46df00ffeb50))
