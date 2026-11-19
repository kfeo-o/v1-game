// CC0 concrete sampled from ambientCG Concrete 034. See README.md.
const NEON_CONCRETE_TILE = {size:128, pixels:
  "MAAAlnyJom9jb7x8iZaioolviZZ8r8mvr6K8fInVfJaWbyMWSWNWY2N8iW9viXyilomJiXyWiXyJoq+voqKWopaJiXyWibyi" +
  "lpZ8fHyJiYmWiYmWb1ZviZaiopa8yZZjSVZvVkkwPGNjfImJb4mWonyWoomJb4lWY1Ywr5Z8PIkWYzxjbwBvVomWom98osnJ" +
  "1XyJvK+vvLy8vK+JfK+8VjA8PDxWY1ZJfHx8b2+JfKKifIl8Y298fImWoqKilpaioq+Jb3xvlnyWool8fJavr298lqJvSXyW" +
  "iaKWfNV8VlZjiW9jVjBjVlZvlpZ8iZavfG9vb29viZZvYyOvoq8jVlaJY2NJFkljlq+Wr4lvb6/JllaJr6/Vyby8ybw8fJZJ" +
  "PAljool8SUlvb4lWiby8oqKJiW9jb4mJiYmWiaKWia+viW9vY0lvb2+JlnyJoq+vb3x8lomJlq+vfLyvYyMwY4miYzxWMHxJ" +
  "Y298iYmWlqKJlpZWb29jVlZjVny8onyJSTBjFjAwVqK8onyJb1aWr4lvfImvye/v/OLVony8b1ZjMG/JonxvvFYAY2N8iZai" +
  "opaWlpaWoryvoomJiaKWlq98VmNjSVZjVpaWlpaJlpaiVklJVm+WlqKJfCM8iW9volZ8PCNjfEmJfIlvY3x8fJaWlomJbzxJ" +
  "Y1Y8iYljVpZ8VjxJiXyJMJbVb2NjY6+ir8nVyZZ8vPz8ycl8fLyWlpaWVlZjb3x8iRYASW+Jlq/Voq+vory8ycmiopZ8lomJ" +
  "iW88VmNjb298r5aWlqKir3xjb0lJb4mJiYkjADzVlgAJIzBWSTxjY0lJfHxjfHx8iZa8vLyJSUlJPGOWiaJvY5aJSYl8SVZj" +
  "PEk8Y2NJibziycm8r7zV4u+Wojx8r5aJ78mJSTxWiTx8YwAjb2+Wr7yvr6Kir7y8vKKiopaWiYmJiTxJY1ZjY3yWr5air3yJ" +
  "iXxvb29jb298ljAJMHwAAEmifIk8Fm+JfFZviZaWoolviZZ8lryWVmMwiaKJfG98bzxJvEk8IzCJYxYWIzB8r+LiybzV/Pzv" +
  "vKI8b5aWoqKviXxjSZaWSWMAFnwASXyWvJaJr6/Vya+ionx8iYl8iaKJPDx8Y2N8Y3yvopaWlqKJY3xvfGNJbzBvSWNjSQCv" +
  "vK/vr1aiiYlvb29vfHyJiaKWfGOJr6LJb0nJ1ZaifHyJVhY8iSNjMHyvSTwAFmN8ory8yeL8/OLV4pav1aKvfKKJlpYjb3xj" +
  "bwAAFlZWlpaJiaKioq+vvKKJfHyJfG+Jom8wSWNjfGNWfKKioomv4tV8b298b0ljMDB8vKJjFomvr6KvvHwwYzwjPG98lqKv" +
  "r6+8lqKvY8lWb/ziybx8lpY8IzC8YzxjI4lWFgkAY2+JoqKvvNX87/zv/NWJb29jSWOvvEkwVmNvAABvb298fGN8fJaioq+v" +
  "lpaJiYmJlqKWSSMwVkljVlZ8lomWlpbJvG+JVlZWSTBWb3xvlklWPHxJPHyJb2/Jlol8fHyWvMni1dXV1a9vvLzV/NXi1a9v" +
  "iVY8b+K8Y3xvYzAjMImWorzV1by8r8nv/OLvya+vlnxjiaKvlnw8bzAAb9WWiW9jb3x8fKKvoqKWlqKvr7zJr6J8PDxWb29W" +
  "Y2+JfImWiZZvPJZ8lnwAFm+JbzBjSTxjY29jPGNviaKiopZ8fJaWvNWJlq+vya+87+/i7+/8vFZviWOi1e+vY4l8MEljydW8" +
  "yfz87+LV7+/i7/yvVqKir8mvvLx8bwAAADC8r7yJiWN8iYmioqKir6Kir6KivMmviYlWPFZvVmNvY29JVmNvb5ZvY3xjlklW" +
  "VlaWFnx8fHxWY1Zvb1Y8IzBjY3x8lqK8vKKvvLzVr7zV4vzv7+/ViW98SXzV7+J8fIljSWPVr8ni7/z87+/87/zi1a+Jb4mv" +
  "r8nVr5ZjAABJvJaJiYlvb29vfHyJlqKilq+ivNXJ1bx8fGNWY1ZWY29jYzxWVkkWiTAjSTBviVZWiXxjY5aJlomJiXyJVlZj" +
  "Y3xvfImJfJavvLyvycnJr9X8/OLV4tWiibxWfMnJyeJJb3yWb8n8/Pz8/Pz8/Pz8/PzvvLyWopair6+iiYljFqKJom9jb2Nv" +
  "Y1Y8Y6Kir8miorzVycmviXxvSUlWVnxvSVZJPGNvVgkwSRYwMDBJMElJVlZJb2NWfGNvfIlvVlZviXx8iXyJlpair6+8oq/V" +
  "ydX8yby81dV8lkljlq+vr6KiolaJr+/8/Pz8/Pz8/Pz8/O/Jya+8oqK8r6+JiZaioomJfHx8iYl8VkljiXyir6+ioq+vool8" +
  "b29vVkmJoq+vr6+ir8mvY2NvVmMwSVZvfGNWY3yJlm+JSYmilpZ8fJaWoqKJfHyJlomvvLy8vNXJr+LivKK8lqL8STyJfJaJ" +
  "otXVvJaJfJavlqLiya+vydXJycnJvK+ioqKvr4mJoqKilpZJVklvoolvfG+JlpaivMmiopaWr29JfGNWlsmvyeLJr5aioqKv" +
  "yZaJlqKJfHyJiTxWb3yilpaWydW8r7y8oqKir5aWlq+vr7yvycm81eKJosniybyvifxjPKJ8fGNWvHyJb29jVjBJI3yib6+v" +
  "vIm8ory8r4mJiZa8r6JvlqKifHyJMGOWfFYwY2NvfJavvLzJloljPG98SYm8r7y8ycmib6+voqKWSWOv1aJ8Vm+JfFZWY4mW" +
  "oq/Jr8nJr7zJ1eLiycnVyaKvycm8ycnJ1a98ycnVopa81W9vom98Y0l8Vjx8Y0lvSXxWr7yiycmib5avr6Kib2+Wibyvonxv" +
  "iaKJb1Y8b29jVklJPGNjfK+ivLyibzxjY0lvY3yWlomWonxjY3yJb3x8b298iW9WY1aJfJav1eLiydXi4uLiydX84ry8oqK8" +
  "r7zVyaKvr7zJyXyWr7y8ouLib4miSW9jPEk8SZZjfKJ8iXyiybyilomvlq+8fIl8ool8lq+JfHx8lpZJiW+WY2NWSW9JVm9v" +
  "lpaiopZvYzAjI2NvY2+Jb3x8Y1ZWfJZvY2NJVlZ8fHyJlmNvopaJr6+v4tW8ybzVvK+voq+vorzJ1byWr5avycnJlnzJ1cnJ" +
  "1e+JVqJWSUkjVjA8VkljiYmJfG+iiXx8ia+JfHx8ibyviW+WlklJY3yJoomir6+WfFZjbzxjb2NviYmWlm8wCRZvlomJopai" +
  "r5Zvb4mJomM8SVZJY2+JY6KvlqKvvK+ilomvlqKvr6KJfHx8oqKvvNXivKLJvLzJ4qJWvPzVybzJ1UlJVnwjMDA8SQA8b0l8" +
  "iW+WiW9viW9vfJaWlpavoqKJlqJvSQAjPG+JfKKiybxjMGN8b1Zjb4mWfJaJPAAWPIl8Y4mJiYmJlpaJiYl8lnx8b2Njb2+J" +
  "iXx8r8nv4q+vlpa8ydW8vK+8ycmir7ziyeLi4vzVvLziolaWya+8llaiPG9vPCMjIzAJCSMwMEljiXyWY4mJY2N8iZbJr6KJ" +
  "lomifHxWFhZWb4l8lqKivK9jSVaJYzxvb4l8iWNJFgBJb29jb3x8Y2N8lnxvb5air4mJb1Z8lq+ir8nJ4uLJr9XVvMm8vG98" +
  "oq/VvKKWlq+8ya+i1a+JvNW8lsm8lpZvPJY8b/x8VklWSRYJMDw8Y1Z8b4lvfIl8fJaWoomWlomJr5aJiVYwSW9vY2OJfJav" +
  "ya9WVpZ8VlZvY2NvSVY8IzBjYzxJb2+ifHyWlol8lqKvfJaWfJZvvKKWycnJvImib3yilqJ8b29viaKJiZaWr6KiiZaWlqLJ" +
  "vLyWr4l8yUljbzxj/ImviVZjPDBJb29jVm+JlomJlnx8fHxvb4miiXyWfHx8iWNWVm98SYmJiaK8vHx8iYljSWNWVnxvPCMJ" +
  "PIl8b2NJY29vvMm8lomWlpaJfImWlpaJfG98fIl8SWNjSW+iolZjVmOJiW9vfImWoqKJlqKWlomJoqKJfG+iYzx8b0nJ75Zv" +
  "SW9JSW+WiZaWlqJ8iYlvVmNvb4mWfJaJlol8b3yWom9jiXxWlqKiosm8fHyWiW98lnxWVlZvPAmJlolvb29jSXyJb3xvY3yi" +
  "iXyJfG9WiZaJfG+Wr4l8iYlvb3yJY4lvVomWiYmiiYmir4mWvKJjY0kjiW88I4lvfGNWVm+ib29vlmN8lqJ8lolvb3xvfHx8" +
  "b3xvfHx8ool8iXx8lqKiiYmWom98lq+vvLyWb6KviZavfDwwSXwjSVZjom9vPFaWlnxjb2Njb29jY3x8Vm98fImvr5aWiW9j" +
  "VlZJY5ZviXxWVm+JlpailpaifHxvr4ljfDAwIwBWiWOJfIl8Y2NjY0lJSUlvfFZ8lmNjiYl8iXx8fG9vb3yJiYl8iYl8opZ8" +
  "iYl8b2OJiaLJvK+WopaWiaKJb3xjPBZJPHx8YzA8Y6JjiYl8fG9vYzwwSWN8iaKWonyilol8fHxWMCNjiW98fKJ8b2N8opaJ" +
  "oq9jb4ljlmNJPDwJADBWSRZjr6JjSUk8VkkwSXxJPImWb2N8fG+JfImJfG98b29vfHyJlpaWiXxjY1ZvfImJoq+ioomioomW" +
  "iW+JfG9WVklvfGM8I29vb298MDwwSUkwSW+Jlol8Y298VpaiiZaiiW9jVm+Jr7yWb1ZJSUmJlomWlryilmNvb2MWAElWY28W" +
  "Y0lJY298VklWSTxjfJavvJaJiaKWiZaWiZZ8b3x8b3yJia+vopaiiYmWfHx8fJaWr69vb4mJY5aJY2OJVkkjMEljPDBJVmNJ" +
  "MDw8STBWY29voqJ8Vm9vY3x8lol8vNWvlm9vVnyvopZJVq/J4snJotXVvJZjY4kwMDwAb3xjY0lvfImWfHxvVlZJVklJlpZ8" +
  "lnyiopaWr5aJiW9vfHx8iZaWr6+WoqKivKKWlpaJlpaioomifHxjiXxJMGN8bzxJb29jPFZvVlY8Y1Z8fHxvb0ljb29jb6Ki" +
  "fJZ8iZaWlm98Y298lpZ8opaiyeLi4uLv/PzJopZvb29jCSNjMDBWbzx8Y5aWlpaWvMmioomilqK8ory8ybyWb29vb3x8b3x8" +
  "fImiycm8oryvlomJY2N8b3xjVnxvfIl8b2M8FjBWVmNWPGNJfHxWSWN8Y4lWSUlJSWNjb4l8opaJY1aJr29WfKJvSXyvr6LJ" +
  "yXyJvJaJlryioq+iiZaib4kwADwWPGM8VmNWlpaWlonJycniybyvr5aioryib1ZjY29vfHx8iZaJosmvopaJiW9vY0lJb29j" +
  "Y3x8b2+JiXyJbzx8PEljb5aWVjBviXxjYzw8PDBJVlZvb3x8iW+JlkkwVq+8olZjvIlWlq/Jr+LVonyJb1Z8b4mWom9JY2Nv" +
  "lmMWSUk8SSOJVmN8iXx8fHxjY2NvY1Zvbzw8Vm9vb3xvb298fHyWooljVlZ8r5ZvlpZ8iZaWfHyWlm9JVmNJVlYwI0ljIzyJ" +
  "iVZJFkl8iYlvVmNvb298iW+Jb3yJiYmJb4mWyaK8oomJVjxJiby8r6J8fG+JfG9vb4mWlnxjb3yJYyNWPEl8llZWPG9vY29v" +
  "fG9jVm9vfKKWIyNjb298iW98fHx8fImJb0mWvLyviXyvr5ailomioomJfG9jb2NjVkkjPG88Y2+WiSMjb2NviXxjb3w8VlZJ" +
  "Y3xviW+WfG98fJaWfKKiyaJvVjyJlryionxjb29vfIl8b3x8iXyvfG9WFjw8fIljSUk8VlZWb3yJiXxvb2NviW8jVkljfHx8" +
  "b298fImWlpZ8iaKioolvoqKWlpaJfHxjSXx8b2NjVklWMBaJb2MwMGOiVlZWb1ZWADxjYzxJPG9jSVZ8VlZvfHx8iZZ8fJbV" +
  "onxvY3xjlnyWlnxvVm+WlpaiY0mWonxjfEkWABZWb29WY3xjY298lnyWiYl8b298iSM8VmN8fGNWb3x8iaJ8iZaJiXx8fHxj" +
  "iYmJopavyaKJlomJr6KWY1Y8I2NjPAA8PDxWMFY8FjAJSUkwMDw8SUk8Y2NjY5aJiZaioq+JltW8Y0ljVhZjb2+JlpaJiZaW" +
  "lol8lpaWiXxvYyMAFjxjY29vY1Zjb4mJfG98Vjwwb4lvViNWPHyJb3x8b3yJiXyJopaJlnyifGOilpair9XJ78mWvNW8r6+i" +
  "ljAAPEkwCXxjCSMAADxjb1ZjYwAACTBjfHyJlpbV4uLi1a+vr8nJvMl8IzxWMElWSYmWopaJiaKilqJviZaWiWNWFhYWVm9j" +
  "lm9WVlZvfHxjY29jVnxjlmNjb2N8lnx8fHx8iXyJiZaiomOJibyvotW8r8m8vNXJlm+Wopa8ybzVfCNJY0k8FgA8FiMwY298" +
  "VjxJVlYwVtXV7/yiie/8/Pzv4q98r6+ir5YWPGNWY2NvlomWiYl8iaKiom98iYmJlkkAIzBjb3yWfElWb3x8fG9jSUlWMHyW" +
  "fIlvSWNjY29jfImJb29jvNX81bzJ/NXJvNWWY2NjibyvvJZ8r7zir8nJSTyWbzBWCTwjMG+v4q9jSWOvr4mJiby81YmJ4vz8" +
  "/PzJr6K8oomiojBJb0ljY29vfG98iW98lqKifHxvb2+iIwkjMElvb3xWVm9vfHx8Y2NWVm8WVpZjiZZJb29vY1ZJY4l8iZai" +
  "osnJ1e/Joq98SUljY3yWoomir5avou+Woq8jMIljMG9WbzAWSWOv4qKvycnJ7++ivLyvia/8/O/i1ZaJoq+JfK+WMDBvVlZv" +
  "VlZ8fG9vY3yJoqJ8fGNviZYjCTA8SVZ8fGNWiW9vb4lvY1ZJb4ljfGNWfIl8b3yJVm+Jia+vllYjMImW4ryJlq98iXyJb3xj" +
  "VmN8iZbV1bzibzAjb5ZjPEl8IwkJPGPi/O/i1a/Vya+878mW1fzv4smvlnyJfG+WyXwWMElJY0kwPGNjY2N8lm+ioqKWSWNj" +
  "YwAJPElviXyiPFaJb2+JfG98fEk8VlZjVmOWiaJ8osmJiXxvlpZ8SQA8vMnir6Kib29jVmNWY2NWY3yJluLJ/O+WIyMWfDwA" +
  "PCMACRZWfNX81dXVvMnV1dX879Xi1cnJoqKJlpaJltW8PBYjPDBWMDw8SWNJVm9vfImir5ZviVYwFgkwMHzV/NV8opZvb4mW" +
  "fHxjSTxjVklJVm9Jb3yvonxvb2N8loljPGPvoom8iW9vVjw8STA8Yzxvb3yWr6Ki1a88PCNjllZvfAkJMG9Wye/JvMm8r6/J" +
  "1eLV1Zailomiia/V1cnVycmJIzBJVlYwMDxjVkljb3yJr9W8lpaiY0kwCRYwr8nilq+Jlnx8b5ZvfG88SW9jSVZjSWNjicl8" +
  "Y2NWicmvfDxJiZaJVpaJY1Y8MGNJY6KWVmNjiYmJb2OJlnw8PFaWY6LiFjA8oonV4sm8ybyioryvvK/Jr698b4mJr7yvvOK8" +
  "lolWPFY8PGNJPG9jSXyJosnJr5Z8iXxWSSMAPFavlolvb6JWfIlvY1ZWlnw8fGNJY29JY3xjr4mJr6KJiVZWb5aJfG9WfHxW" +
  "VlZJY2+JopZjSW9vfHxjY3yiiTwwMG9jiXwjiUlv1fzvr+/vr7zi1aKivKKir4l8b4mJr8nV4tWJfGNjb0lJfJZjb1Zvr6+v" +
  "lnxvb2NvfGNvMCNWY6+WfGNjoomJiYljVkl8bzBWb1ZJVklJSW+Wb4mvvKJWPJaJia+8lq+ifHyJlqKWoq+8vHwjY4mvfImW" +
  "onwwMDwwlry8lmNjb5a8/JbV4nx8vMmvoryvoomWb2NWb5a8yeLvvLyWVmN8b2Oir5aib6+WiYl8Y29jY4l8Y1YjPFZJiZZW" +
  "PGOWrzxWY2NjSVZJVjBJYzBJVjxJibyWSVZ8llZjiW9joryJlsnJ/Pz8/PziybzJr4lviaKJiZaifEljSUnJ/K+WlpZvlqLJ" +
  "ou+vVmN8llZv79XJoolWSVZjosm8ye/JoolviVZ8b3yWycm8ycmviYl8Y2OWiXxvMAlJSUmiiWM8fGOvb2NjVlZJVkk8IzBj" +
  "SVZjPDxjiZZvVmNvb2NJfEkwr9X8/Pz8/Pz87+/i4uK8lnyJonxjlqKJSVZJiVZvY4nJr29vibzJyW9WSUlWPEnVya9vY1ZJ" +
  "SVZ8yby84q+WVnyJb4ljfK/V4q+i7+LJ1cmvoqKiSVZJCQkWVnxjb0lvfLyifHw8b29WVjBJVkl8fHxWVnyJb4mJb2OiomOW" +
  "llbv/Mmvr8m8vLy8lrzV4tW8r6Kvopair1ZWSZaiY2OJifyib698vOKJPFZvY2NWSaLJlmNjPCNJPG+ir9XJopZvfHxjb5ai" +
  "vNXVyaLv1eL8/PzJyeLV4m8wAABjb1ZJSWOJonxjSW9vb2NWPDAjSZZjiVZJVm98Y4ljVomvydWJVsnJiW+WiWNjMGM8PFav" +
  "4uLi1cmviYm8VlZJoryvfG+J/Hx8iXy8/Hw8Y2MjVjwWSXyJY1ZWPDAwPJa8vJZ8b5ZvfGNjb3yJvLzi1dXi/Pz8/Pzvicn8" +
  "okkjMElWr4lvY6KvY3xvY1Z8b1Y8PFZJSW+JVlZJb698VjxWiYmiojwAfKLV4sm8iW88fKJJY5ai4vziyZaJlqJjSXxjY4lv" +
  "b5bViYlvfNXvvBYjMDBJMCMwb29WSWNJPElJia/Jr5Zvb0lWY1ZjfHxviZaJibzi7/z8ojwjPPx8lpZWPKK8vJZvlpZ8Y29j" +
  "Vm9jY288SUlJY1ZJSUljook8PElWb28WAACJlsnVool8lpaJiUlWVlaJydXVr5aiiW8wb1Y8fJaJlsmiomN8ydWWCQkJSW9J" +
  "I1Zjb4ljPDA8PDxviby8iW9jVlZ8Y1ZviW9JSTwwVlZjorxjVnw8lomJfElWyaLJr2OWonxvfHxWb4lJI0lJVmNJSWNjfKJv" +
  "Y2M8IzAwCQAACUlvlqKJopZvb0lJY1aWVlaJ1fzioqKWYxZJllair29WlpaiY0mWia8JCQA8SRYwMElJiYlJMDxJMFZWb6+J" +
  "fG9JfDAwVmOJfGNWVlY8SUlWlqKvlolvPEkWPGPvr8m8r6KJlqKJlqLi79Vvb3y8ya+ivKKvr1ZJfFZjVglJVgkjr7zV4uLJ" +
  "1aJjPBZJVnyJiaLV1eKWiaJvMFavPGOJb2OvopZvVolviRYJADAwPFYjSVZWiYk8MDBjY29vfHxvfFZJPEljVmOJYzxvYzwj" +
  "VlZjouKiMIlJVmNvieKvyWOJiW98fImivPz8/O/vr+LV4smvfImWfG+WY2OiSTxvY2/84uLi1a+8ybyilnyJfG98vKKJosmv" +
  "r3w8VqJvVmNvfNVvY4ljfKJJCSMjVjxJIyNvb1Y8fJZjPDA8Y29jiVZjSRY8STA8VolvPIljMElJViNjfK9Wlm9jb2+W1Ym8" +
  "Y1ZvlolWb2NjlqJ8b3yivLxvfKKJb3xjPEkWCSMJCYm8r+K8ycmvoq+vvKLJr7zJom9vfImWr4miiTxJlomiVm+i4klJfG9v" +
  "fBYWPG8WFhYAADxJSTxjvKJvY1Y8iW98VlZvSUljViNWlmNJfG8JI0kwPFZWVm+Jb1ZJVm+JVm+Jb2N8iWOJiWOJlqKJiXyW" +
  "yaKWlnxjVmNWSTwWMEkjia+voq/VvIlvb6KifK+vr9Xir3xjb4ljY4lWY3xvb6K8r9Wvb2N8iXxvbyNJbzBJVjAWAAAjY2+W" +
  "r8nir4mJb3xvY29vPFZWMFZvMCOWlmM8MDwWVmM8Y2Njb2NviYlvfFZWSWOWfIl8Vm9vlm98b3zVb69jVlZJVkljSRYwVjxJ" +
  "oryioqKWiby8lolvfHyWvLzJvKKJlryWr2NjlnxWibzJr4mJVm98oq9JMDBWY29JSTwwPDBJY1avvK+8ybx8Y1ZWVm9vPDBJ" +
  "VlZJVlZJiW88PDA8MG9vY3yilomJfG9jSTAwY4lvfHyWiXxvfK+Jr6/JyYk8Y0lWfHxWIzwwMJa8opair8nJycm8opZvfKKW" +
  "lry84vzVvK+ilkk8PEljr8mWvJZjY4mWljx8SVZjfFZjY298VmNJMGNjfJbJvLxWMG9jY5aJfFZJSSNvVjxWPG9JSUljlpaJ" +
  "lnyJlol8fHxvY1ZvfKKvlm9vY2+Wb4l8Vm+WY2N8b5aifGNWbxZWoomivK+vybyir6+Jlol8iYl8fHzJlpZJVkmJr5Y8ibyi" +
  "1eLVlnxvr6JjY3xWVm+iorzJvK+viXxjMDBjfImiiYl8b5ZviXyJb3xWFklvVom8oomJfG+JfG9vVpaWiZaiiZZ8b1Z8r6KW" +
  "Vnyvr6KWom+Wb2NjlnyJoomWb6LJY2N8b298oqKvoqKir298b2+Wlnxjb4mJlm9viWNWr29vooni4rxvfKLiY29vb4mWosnJ" +
  "r6+Woq+voq98Y0ljVnx8fHyJfImWiXyJfIl8Y6J8lok8fKJjSWNjY3x8lol8vNWvfGNvb5aWfKKir7zVorxjPLyJiZaWopai" +
  "vJaJoq+viYl8iZavia+8iXxvb2NvY3yWfG9jb3x8Y5aWiWNJY1Z8osnvvHxvicljfKJvr6+Wlol8fG9vfHxjibyWiZaWiYl8" +
  "b5ZvY298iXx8fElJfGNWY1Z8iUlWY4mWfIl8iZaWlmOib0l8r6+iycmJlryilol8lqKJb3yWiZaifJavvMnJr6KvvLy8ycm8" +
  "lpZjb29WVnxWY2NvY3yJfJaiiW9voq+iicnvom9Jb4mir6JvMElWY2NWY1ZWVlZvb2+iiZaWbzxWY2NWSW9jb2+JI1Z8b4mi" +
  "iXyJY3x8lpaJY1aJr2NWb7yJVpavya/i1aKWlnyWr6+WY5Zvb3x8fImJlryv1e/Jr4mJom9vlomWr3yJY2NjfHx8Y3x8vPyW" +
  "fG9JfFaiibyJr698bzxjiZZ8STwwPElvMDxWYzAWY2+iydXiokmJVlYwY288Y4mJiYmJlnyJosmifIl8fHyJlkkwVq/Jlklv" +
  "llY8SYm8vK+iiYmJfJaWool8iXxjfGNviW+JotXV1cl8SVY8MDxjfImvfHxjfImJiYmWr6/JyYlvbzxjr3xWfHwJSW9WY1ZJ" +
  "VjxJVmNWY2NJVnxWY2OiyaKir8nV4ryvfDBWVklvb3xvfGOJfJaWoq+JfImJlomWb4mWyaK8opaib1Y8iZa8oqKJfIl8iYmJ" +
  "lomJlm9Wb4mWoqKWvNWiYzxJY2NJMDxjY4mJfG+JlqJ8lqKWonyJSWNvMKKifDCJPAAAlnyJom9jb7yJiaKiloljiZZ8r8mv" +
  "oqK8fJbifJaWbxYWVm9WY2N8iW9jiYmilomJiW+WiW98fJaiiaKivJZ8b1Z8Y5Z8lqKJfHyJoqJvb4mWb0l8iYmilonJb1ZW" +
  "Y4l8Y1YwY1ZWb5aWfImWr3xvb29jb4mWb2MWr6KvI2MwbzxjbwBvVomWomN8r8nJ1XyJvK+vvLy8vK+JfK+8YzA8PElWY1ZJ" +
  "b3x8b298fJaiiYl8Y2N8fHx8iZZ8fKLJr29JY1YWY29viYmJiZair298fIl8fImWoom8r28wMGOJom88VjBvSW9vfImJiZai" +
  "iZaWY29vY1ZWY1Z8vKJ8iWN8Y2NJI0ljlq+Wr4lvb6/JllZ8r6/Vyby8ybw8fJZWSQlvool8VlZvb4ljia+voqKWiW9vfJaW" +
  "iYmioq+JosnVfBY8VjBJY1aJlpaWlpaJiW9vVkljiXyWlok8SYlvb6JJfDwjY3xJiXyJb2N8fHyWlpaJiW88SWNWMImJY1ai" +
  "VjBjFjAwVqK8onyJb1aWr4lvfHyvye/v/OLVony8fFZjPG/Jonxvr2MJY298iaKvoqKiopbJ1eLV1a+vosnJya+JCTxjVmNv" +
  "fJaJiYmWfHxJVnxWSXx8b4mWSRZWyZYACSMwVkk8Y2NJSXxvVnx8fImWvLy8iUlJSTxjlnyifG+JY0lJiXyWMInVb2NjY6+i" +
  "r8nVyZZ8vPz8yclvfLyWlpaWb29vfHxviTwAY2+WoqLJycmvotXv/Pzi4q98oq+ioqIjPG9JVmNvfImJfG9WMDw8SWNvVmNj" +
  "b6JjIzx8AAlJonyJPBZviXxWb4mWlqKJb4mWfJa8llZjMImiiXxjfJaJSYl8SVZjPEk8Y2NJibziycm8r7zJ4u+Wojx8r4l8" +
  "77yJY1ZjiVZ8YwlWfHyioq/Jya+v1eL87+/Jr6+8lomiljAjb1ZJY0ljlol8fGMjIzAwiYlvY3xjiTxvb1YJoq+v769WoomJ" +
  "b29jb3x8iYmilnxjia+iyW9JydWJonyJfDBJvElJIzCJbxYWIzB8r+LiybzV/PzvvKI8b5aWr6+8ool8Y4mWY28jSXxJiYmJ" +
  "oomWia/i4uLVyZaJoq+JfK9vFjxWVnxWMDxWb4mJY0k8IxaJfIljfHxWb6KWSSOJlqKir7x8MGM8I0lvfJaWr6+vvJair2PJ" +
  "Vm/84rzJfJaJViM8iSNjMHy8STwAFmN8ory8vOL8/OLV4omv1aKvibyivKI8fIlvfEkWVnx8lpaiiXx8osmvvKKWiXx8b2+W" +
  "ojwWFjwwY1ZJPFZviYlWMG9jPG98fHxjiYmifIlJVjx8STx8iW9vyZaJfHx8lsnJ4tXV1dWvb7y81fzV4tWvfJZJIzC8Yzxj" +
  "MIlWFgkAY2+JoqKvvNX87/zv/NWJb29vY3y8olZviZaiPDx8fG+iya+8r6+vlpaJb5aWiYl8lryvfCMjSUlJY2NjbzxjiUkJ" +
  "FgAWiWNJVm+JopZWb1ZJVlZjYzxjb4mioqKWfHyWlrzViZavr8mvvO/v4u/v/LxWiWM8b+K8Y3xvYzAWMImWorzV1by8r8nv" +
  "/OL8ya+vlnxjiZaJiYl8iXwwfIl8iaKWiZaJr5Z8b2Nvia+8r8nVvIl8STA8VjBjY29JADwwIwAWFgAJFjxJfIl8llaWlpZ8" +
  "VmNWb29WPCMwY2N8fJaivLyir7y81a+8yeL87+/v1XxviWOi1e+vY5Z8MEljydW8yfz87+LV7+/i7/yvVqKioryWoqJvbzAw" +
  "CWOWiYm8vKKilpaWopZ8fHyvr6+WvNWvb29WMEkwPHx8YwkAAAkAAFYwAAAAMEljfKKJiZavoqKJiYl8iVZWY2N8Y3yJiXyW" +
  "r7y8r8nJya/V/PzV1eLVom98SXzV7+J8fIljSWPVr8ni7/z87+/87/zi4q+Jb4mir6+ilolvIwmJfHyJoq+vycmviZZWfKJ8" +
  "ibyivMm8ybx8YzwWPDBjb2MjAAAACQkJFgkwPBYWIzxJb298Y3xjY3xjb3yJb1ZWb3x8fIl8iZaWoq+vvKKv1cnV/Mm8vNXJ" +
  "ibxWfMnJyeJJY3yWb8n8/Pz8/Pz8/Pz8/Pz8vLyWopaWopaJfHxjPHxjfGN8oq+vr7yWvKLJiUlvoqLJvK+iiWNjYyMJMGNv" +
  "STAAAAAAAAAwIwkjSQkWMElJY3x8fHxvfDyJlpaWfHyWlq+iiXxviZaJr7y8vLzVya/i4ryivJZvljxjlq+vr6KiolaJr+/8" +
  "/Pz8/Pz8/Pz8/PzJya+8oqKiopZ8fG9vY298Y2N8r6+ivKLv/JaJfKKJY4mWlnyJSW9JFjxJMGMAIwAAAAAWAAkAAGN8MCM8" +
  "SUk8VmNjfHyJicnVvLzJya+ir6+Wlpavr6+vr8nJvNXiiaLJ4snJoqL8STyJfImJltXVvJaJfJavlqLi1a+v1eLV1cnJvK+i" +
  "lpailnxvfIlvY29jY2Oilpavr5aWSWNjvOJ8opaJom9vVhZJfCM8IwkWACNJACMJAABWSVZvb0ljb29WSUlvfJaiybzJybzJ" +
  "yeLv78nJ1cmvr7zJvMnJydWvicnJ1aKWlvxjPKJ8fGNWvHx8b29jVjBJI4mib7y8vJbJr8nJvImJiYmilnxjfHxvfHxvSXyi" +
  "fKJ8VpZjb2/v4snVonxjPEkwSTBJPEkwABYJAAAJCUkWVgkAPCM8MElWb2+Jia/J1cni/O/v7+Lv/PzJvK+ivK+81cmir6/J" +
  "ycl8lq+8vK+81W9vom98Y0l8Vjx8Y0lvSXxjycmi1dW8fK+8r6Kvb2+WiaKiiW9jb3yJfHxjfK9Wr2PVokmvb+KvvMm8YzBW" +
  "FglJPBYWSTAjFgAAAAkwVgAJABZJFhYwY4ljVnxvfKKvvPzv1eLV7+K8vKK8r6/JyeK8lq+Wr7zJyZZ8ydXJvO/ifImiSW9j" +
  "SVY8SZZjfKJ8lom81byilpbJr8nJiYmJoolvfKKWb298fIljb2+JlmOiY688I298r2+Jr6JWSSMJVm88IxYWMBYAAAAWAAAA" +
  "AABvfIkjMBZvfG9jfJaioqKWyby81dW8lpaWfK+ivMnV4ryiyby8yeKiVrz81cm81e+JVqJWPEkjVjw8VklWiZaWiW+vlpaJ" +
  "osmiiYl8lryviW+Jom9WY3x8lpZ8fIl8VlYwSW9JIzA8PG+ilmMWCTB8YyMjAAAAAAAAAAAAACNvY2N8b2N8fFZjb6LJ7+Kv" +
  "vK/J/Pz87+LV4uLJvLzJ4sni4uL81by84qJWlsmvvJbJ1UlJVnwjMDAwSQA8b0l8lm+JiXx8lol8ia+vr6LJr5aJiZZvVjBJ" +
  "SXyJiYl8opZWVlY8VlY8MG+iSYl8FgAJPFZWIxYWIwAJCQAAADCviZaJYzBWb2Oilpa8yeLi1cni7/z8/PyiouLi4smvr6K8" +
  "vMmvotWvibzVvJbJvJaWfFaiPG9vPCMjIzAJCSMwMEljfG+ib4mWb2+Joq/iya+WoomifG9WPEljfHyJlomWvJZWY28jSUlj" +
  "Y3xWfEkjAAAwVkkWADAjSQkwVomJlpZvb1ZvMGNvb6JvfLy8ybyJr3yW1dXVopaJoq+vopaioryioomWlpaiycm8lq+JfMlW" +
  "PJY8b+98VklWSRYJMDw8Y1Z8Y5Z8iaKJlry8r6Kir5aJr5Z8iWNJY298fHx8Y3yivIljVlZJVklJMDxJMDwjIzB8Y1YwCRYJ" +
  "MMmvyaJJVmOJfGNvfG98iWNWb3yJfElvb2Oir6KJiVZviZaJiXx8lqKifJailpaJiaKiiXxvr2NjfDxj/ImvfFZjPDBJb29j" +
  "VnyWlpaWvJaJfJaJiZavonyifG98fG9jb3yJfGM8VqKvr2+WlmNJMDwJFm9jFgkJiYlvSTw8IxaJr3yJb2Njb4mJfG9jMImJ" +
  "fHx8iaJ8b4mWiYl8lqKWVm+WlpaJr4mJoq+Jlryib2NJI4lvPCOJY0l8b0nJ75ZvSXxJSW+WiaKWoq+WopZ8VmNvb5aviaKi" +
  "opaJb3yJlomJopZ8iXyJr7yvosm8b1ZJYzwjMDxjMAA8SYlJPAkJiW9WY29jY0lJVmNvbzxjb3yWvK+WfG9jY1Zjb2+WfG9W" +
  "SWN8fJaioqKWonx8b6+JY3wwMCMAVoljfGNWVm+Wb29vom98lqJ8lolvb3x8b3x8fHx8iYmWr5aWlol8iZaiiZaionx8fKKv" +
  "lpavlomioomWYwAJMGMJPDxvYzwACUmWI1ZJVlZjVmMwMDBWY3yioqJ8opZ8b3yJVklJb5Z8iYmiiXxWb6KiiaKvY2+JY5Zj" +
  "STw8CQAwVjxvfImJY2NjY0lJSUlviVZ8lmNjlol8iXx8fIlvfImWfImJiYl8opZ8iYl8fG9vb4mvr7yJiXyJfHxvSW9JIwlJ" +
  "b29JIwBJVlZjYwAAADwjACNviZaJb2Njb1aWlomWr6J8iXyir5avr2NJSTxJlpaWlpa8opZvb29jFgBJY2NvFhZjr6JjSUk8" +
  "VkkwSXxJPJaWb2OJfGOJb5aWiW+JfGNviYmJlpaWiXxvb298b4mJiZaWoomionx8b1Z8fGNJPDw8YzAWMDxWMBYWACMJb29j" +
  "fKKib0ljY2OJiaKWb7zJyaJ8oqKWiYl8VmPJ7+/JyaLV1byWY2OJMDBJAG98Y1ZJY0lWY298VklWSUljfJavyZaJlqKilomJ" +
  "lq+WiXx8Y29via+vopaiiYmWiXxvfImJopZjb5ZvPG98PEmJPDwWI3xjVjA8Y0k8MEkwiZaJfHxWY2NjY2+WoomWiYmJlqKW" +
  "iZailq+Wb3zV7/z8/O/v7/zvya+Wb29vYwkwYzAwVm9vfImWfHxvVlZJVlZJlpaJlomir5aWr5aWiWNvb2Nvb3yWr6+ioqKi" +
  "vKKioqKJlpaWlm+ifG9Jb28jCVZvYzw8STxWMG98STBWfGOWY0kwPEljb3yWiaKWlm9vlqJ8lpair8nV7+/Vye/V1dWiiaK8" +
  "oqKvoomWom+JMAA8FjxWSUl8Y5aJlpaJvMmioomilqK8r8m8ybyJY1Zjb3x8b3yJiZaiyby8r6+vlpaJb2N8b2NWPG9vfIlv" +
  "VkkjACNWSVaWiUkjY4l8Y2M8MDAwSVZWiYl8b4lviZZjSWO81cmvfLzV4uLV4uLv4ryWr4ljfG+JlqJvSWNjY5ZjI0lJPEkw" +
  "VmNWiZaWlonJycniyby8r5aioryiY0ljVmOJfHx8iYmJlqKivMmilm9jY0lJb29jVm9vY1Z8iXyJbyNvMElWb3xWPAk8b3x8" +
  "Y0lWb2NWY5aJiW98lpaJoomvvOK81a+Jr6KWlpair6KWb29viXxjb2+JlpZ8b3x8iW8wVjxJfJaJY298iYl8iXxvY2Nvb2Nv" +
  "bzw8Vm9vb29jY29vb2+JiYmWiXyvr6KJlol8iYmWfImWiWM8SVYwSUkjCTxWFjx8iXwjFmNjY3xvVm9vMFZWSWN8b4l8lolv" +
  "iaKvr6KilqKWiXx8lnyvopZ8b29jb3yJfG98fImJr3xvYzBJPHyWY1ZWPG9vb3x8fG9jVm98fJaWIyNjfG98fGNvb3x8b2+J" +
  "iZavvLyilnyioomilomioomJfGNjb2NjSTwWMG88Y29vllZWVm9JVgAwY2M8PDxvY0ljfGNjb3yJlqKiopaWlqKviW98b5aJ" +
  "lpZ8b2NvlpaWlm9WlqKJfIlWMAkwVm9vSUlJY2NvfImJlolvb298fHwwVlZjfHx8b2NviZaWfImWlq+vopaJopaWlomJfHxj" +
  "SXx8b2NjVklWIwl8b2MwMEk8VjBWPBYjAElJMDAwPElWPGNjY2+Jb4mJlomilomvr4lvb2NJb29viZaJlomJiZaJiZailpaJ" +
  "fG88CTBJb2NWb3xjb3yJlomWiXxvfG98iTxJY2N8fGNJb2+JiZZvfImJlq9viZZ8iZaJiZavyaKJlomJr6KWY1YwI1ZjPAA8" +
  "VgkjAAA8Y29WY1YAAAkwY3xviYmJoq+voqKJiYmilpaviVZjY0lWY0mWlpaWlnyWlomvfImWopZvYzAwMGN8Y29vb29viZaJ" +
  "lm98Y1ZJb3xvVkljVomJb3x8b4mJiWN8iXyWlomiiXyJfImWr8nJ4smivNW8r6+iljAAPEkjCWMAMBYjMGNvfFY8SVZWMGPJ" +
  "ydXVlnzJvMnJoqKWfImJiYlvPFZvY29jb5aJlomWfHyWlrx8iZaWlpZWMDxJb3x8lm9jY2N8fIlvb29vVm9WiWNvb2+Jlol8" +
  "fHx8iXx8fHyWoqKWfLyilryilq+vr8nJlm+Wopa8ybzVfCNJY0k8Iwk8IzBvr+KvY0ljr6KJiYmvr6+JfK+8vK+ioqKWlol8" +
  "iYk8SW9JY1Zjb3xviZZvY5aWr5aJlol8olY8SUlWb2+WiVZjfG+JiW9vVm9vPHyJb4lvY3x8Y29jfImJfHxjlq+8lpbJ4tWv" +
  "oryJY29vlryvvJZ8r7zir7zJSTyWbyNWY28wFkljr+Kir8nJye/voryvopai4smilpZ8fImJfHyifDw8b2NWfFY8fHyJiW98" +
  "iaKilomJiYmWVjxWVmNjfHxjY298Y298Y2NviaJjfG9vlolWfG9vY1ZWY4mJlpaWiaK8yeLVybyJY0lvb4mWoomir5avr++W" +
  "oq8jMIljPHxWbyMJCTBv4vzv4tWv1cmvvNWvfK+8vK+WiXx8iXxjiaJvIzxWSWNJIzxviW9JSZaJoqKionyJiXw8PFZjfJaJ" +
  "fG9viW9jVm9jVlY8fHxWVlZjb4mJfHx8b3yWia+vlmNJPJav1cnJr6J8b4mJb4lvVmN8iZbi1bzibzAjY5ZjMDwjABYWSXzV" +
  "/NXV1bzJ1cnJ78mvvJavoomJfImWiYmvokkjI0kwSTAwSWN8Vjwwb4mvr6+ilpZ8b0k8Y1aJyfyiSW+WiW9vb2Njb0k8SVZj" +
  "Vm98ltWvycmionxvlpaJYzxjvLzJvNWvfG9jVm9jY29WY2+JluLJ/O+WIyMWfEkAb3wJCTB8VsnvybzJvK+vycm8r698fIlv" +
  "fHyJr8mvvK+8iTAwVlZjMDxjiWMwY4mWlqK8vLyir3xvVjxJVq+84tWJr6KJb29vb2NvVjxJVnyWfG9jiaK8ool8b2OJlnxv" +
  "Y3zVr5bJr4lvVjw8VjxJbzxvb3yWr6Ki1a88PCNjllav4hYwPJaJ1eLJvMm8opavoqKWopaJfG98iaKvr7zVvImJVjxJPDxW" +
  "Y2+ib0l8iaK8oq+vr6+vlnxjPGN8vJaWoq+Wool8Y3xjY1Y8PGN8fHx8iZavya9vVkk8icmvfDxJiYmifKKWY2M8PGNWY6KW" +
  "VmNjiYmJb2OJlnw8PFaWb5Z8I4lJb9X876/v76+81cmilqKWoqKWiXyJlq/J1eLViXxjVmM8Flaib5ZvY5aioq+Woq+ioq+i" +
  "lnxjb3yvlol8ia98lnxvfG98vJZ8iXxWY3yWlq+WfG+WybyWiVZWb5aJfG98lm9JSUk8Vm98oqJjSW9jfHxjY3yiiTwwMG9v" +
  "yZZjY2+WvPyW1eJ8fLzJr6KvopaWlol8Y4mvydXv77y8lkljYzAWY4mWomNvb4l8fKKvoq+vr6+WfHyJfJaiY2N8r6KJfHx8" +
  "ia/Jr4l8ooljY2+8vLyvlq/i1a9WPJaJiaKvlqKifG9jb4mJlq+vvHwjY4mvfImWom8wMDwjlryvlpaWY5aiyaLvr1ZjfJZW" +
  "b+LJvK+Wb2NjfK/JycnvyaJvY4kjIxZJfKKJY2NvlmNvvJavr6+vopZ8iXx8r5ZjVm+v1aKiiYni1a+vyZaiiVaJvMn8/O+v" +
  "Y2OJljxWiW9jlq+JlsnJ7/zv/PzivMnJr4lviaKJiZaifElWSTzJ/G+Jya9vb4m8ycljVklJSUlJ1cmvfG9jVlZjicm8vNWv" +
  "iTxjb0lWPDCiom9WY2+WfImvlryvlqKilolvY3yJb29JiZbVvJZvVomioqKWY6KWouL8ybyWb7xvSUlJVlY8fEkwr9X8/Pz8" +
  "/O/i4u/i4uK8iXyJonxWlqJ8SVZJllZ8iYn8onyvfLziiTxWb1ZWVkmiyZZvY0k8SUl8r6/VyaKWY29vSUlWY6KvVlZWSWOW" +
  "ycmvvK+ivMmilm9JiXxjSVaWltXionyJiaKWiXx8r6+Jb7zvyaJjVlY8SUmivHyWllbv/Mmir8mvvLyvlq/J4tW8r6Kvopai" +
  "r1ZWSZaiY1Zvifx8fIl8vPx8MGNjI1Y8I1aJiWNjVjw8MEmWvLyifG+Wb29WY1ZvlqJvb0mJiYmiycnJvK+8vLyifHxvb6+J" +
  "Vnyiybyir6LJydXJoqKJY2NWfJZvPEkjI1Y8MInV4u+JVsm8iWOJfGNWMGM8PFav4uLi1cmviYm8VlZJoryvb2+W1YmJb3zV" +
  "768WIyMwSTwjPHxvVkljSTxJVomvya+JfG88PEk8Y5a8onw8PHxvb3yvybyvycnVvLyifGOir7x8fMn8osm8r/z8lkljY3x8" +
  "Vm98PEkwPFZJCQlJiZavrzwAb6LV4sm8iW88fKJJb5ai4vziyZaJlqJjSXxjY4lviZbJoqJjfMnVlgkJCUljSTBWY298Yzww" +
  "PDw8b4m8r4ljYzwwfDAwfLyWVhZvb298VmOilqK8vMmWlpZvb7yiyaKJ1dXV1a+WybyJiaJjSWNJSW9WSTAwb2MJIzAwfHwW" +
  "AACJlsnVool8lpaJfFZWVlaJydXVr5aiiWMwb1Y8fIlvVpaWomNWlomiCQkAPFYWIzA8SYmJSTA8STBWVm+viW9vPG8AABZJ" +
  "oqJvI4m8lpZ8VpZ8fHyJr3xvb2+J4q/VyYnJ1cmvoqKJfHyWb29JVjw8PDA8MEkwSXwjACMjAAAACUlvlqKJoqJvb0lJY1aW" +
  "Y1aJ1fzioqKWYxZJllair29vr6KWb0mJb4kWCQAwMDBWI0lWVomJPDAwY2N8b4l8VnxJMAkJABaJlkkJia+JibyvfFYwI1aJ" +
  "fImWlq/ir+LVvOLVya+JiZaJb1ZJY1ZJI0k8SWNvYzwjYzBJPABJSQkjr7zV4uLJ1aJjPBZJVnx8lqLV1eKWiaJvMFavPGOJ" +
  "b3zVb2OJY3yiSQkjI1Y8SSMjb29JPImWYzwwPGNvb4lWb0kAFgkAAGOiSQCJiXyvvK98YzxJb3x8fKKir9WWyYmWvKKviXyJ" +
  "fHxjVkk8MDw8SW+iyZbJr1bJY0miPDBvY2/84uLi1a+8ybyilnyJfG98vKKJosmvr4k8SZZvVlZvluJJSXxvb3wWFjxvFhYW" +
  "AAA8SUk8Y7yifGNWSYlviWNjfDwjPCMAVq9vSYl8fJa8yZZvllZvlnxvfHx8iWN8Y2+Wr5ZvfFZjb29vSUlvool8yfzvyYkw" +
  "MDAAAAAAAIm8r+K8ycmvoq+vvKLJr7zJom9vfImWr4mviTw8iYmiVq/Jr29jfIl8b28jSW8wSUkwFgAAI2Nvlq/J4q+JiXyJ" +
  "fGNvfCNjPAmWomNWb4l8lq+WiW98SW+WlpaJiZZ8b3yWiYl8lomJY298iZZvlsmvooljSWNvFhY8MAkAADAJfK+voq/Vr4lv" +
  "b6+ifK+vr9Xir3xjb4ljY3xWY3xvb6K8ya+JiVZvb6KvVjAwSWNvSUkwMDwwSWNWr7yvvMm8iWNWY0lvfCMWSaKJSW+JoomW" +
  "onyJiVZ8lomivK+JfG9jY1Zvb3yifG9jY3yWlqJ8Y1ZWVlZJVkkjMDxWPAAjSSM8oryioqKWiby8lolvfHyWvLy8vKKJlryW" +
  "r2NjlnxWibzJlryWY2OJlpY8fElWVnxWY2NviUljPDBjY3yWyby8VjyJfFaifHxvfG8JY6KWr6+JidWvfIm8oqKJlpZ8b3yJ" +
  "VklJb5Z8iYmilpaWb2NJSVY8VmNjfEk8b4lWCTAjI6K8opair8nJycm8opZvfKKWlry84vzVvK+vlkk8PEljr9XV1ZZ8b6+i" +
  "Y2N8SUlvoqK8ybyvr4l8YzAwY3yJoomJiW+Wb4mJfG98fAAWr5a8onyi/LyWiXx8fGOWlomWr6KJfHyir4mvom9jY1ZJY4lv" +
  "fElvY1ZvY5aifHxjYwlJr5aivK+vybyir6+Jlol8iYl8fHzJlpZJVlaJr5Y8fLyW4uK8b3yi4mNvb2OJiaLJya+vlqKvr6Kv" +
  "fGNJVlZ8fG98iXx8iXx8fG+JY0mioqK8Y6L8fFZvb2+JiaKWb7zJyaKJlqKWiYl8Y3y8opZ8opZ8b29jY1ZWlpaWibzVVmOJ" +
  "fG98oqKvoqKir298b2+Wlnxjb4mJlnxviWNjr29voom877x8b4nJVnyib6+vlpaJfHxvb3x8Y4m8lomWlomWfGOib2NjlqKJ" +
  "iYlJSaKWlsmvr7xvY2+WoomWiYmJlqKWiZailq+ib4nV4tXJlolvY29WY298lpaWr6+Woq+viZZ8iZavia+8iXxvb2NvY3yW" +
  "fG9jb2+JY5aWiWNJY1Z8oonJ769vSW98lq+iYzBJSW9jVmNWVlZWY29vopaWlnxJY2NvVlZ8b4l8oiNvoom8vKKivHyJiZaW" +
  "lm9vlqJ8lpair8nV7+/i1e/VvLx8fImJfG+Jb1aifImifJavycnJvKKvvLy8ycm8lpZjb29WVnxWY2NjY3yJfJaiiW9voq+W" +
  "iaKvfG9JY4mWfEk8MDxJYzw8VmMwFlZvosnV4qJJiVZWMGNvPFaWiZaWlqKWlq+8r6KiiYl8iZZjSWO81cmvfLzV4uLV1eLv" +
  "1a+iom98lol8VoljY29jfHyJlryvyeLJr4l8om9vlomWr3yJb1Zjb3x8Y3x8vO+WfG9WfFaiia9jMEljVlZWSWM8PEljVmNj" +
  "SUmJY2NvoryioqLJ4uK8vG8jVlZJb2N8b3xWiXyWlq+viXyJiZaJoomvvOK81a+JoqKilpavr6KWfImJfImWonxviXxjb2Nj" +
  "fG98osnV4smJSVY8MDxjb5avfHxjfImWlomJoq/JvJZvbzBWonxJiQ=="
};

// CC0 Column Astra by Quaternius, adapted from the FreeModels GitHub archive.
const NEON_ASTRA_COLUMN = [
  [
    [
      -0.16389,0.19872,-0.32653,-0.16389,0.19872,-0.32653,-0.16389,2.896,-0.83986,-0.16389,2.896,-0.83986,-0.0835,0.32421,0.33289,
      -0.0835,0.32421,0.33289,-0.16389,0.29343,0.17116,-0.16389,0.29343,0.17116,-0.11426,0.32187,0.32058,-0.11426,0.32187,0.32058,
      -0.14034,0.3152,0.28552,-0.14034,0.3152,0.28552,-0.15777,0.30521,0.23305,-0.15777,0.30521,0.23305,-0.16389,2.99072,-0.34217,
      -0.16389,2.99072,-0.34217,-0.0835,3.0215,-0.18044,-0.0835,3.0215,-0.18044,-0.15777,3.0025,-0.28028,-0.15777,3.0025,-0.28028,
      -0.14034,3.01248,-0.22781,-0.14034,3.01248,-0.22781,-0.11426,3.01915,-0.19275,-0.11426,3.01915,-0.19275,-0.0,0.32421,0.33289,
      -0.0,0.32421,0.33289,0.0,3.0215,-0.18044,0.0,3.0215,-0.18044,0.16389,0.19872,-0.32653,0.16389,0.19872,-0.32653,
      0.16389,2.896,-0.83986,0.16389,2.896,-0.83986,0.0835,0.32421,0.33289,0.0835,0.32421,0.33289,0.16389,0.29343,0.17116,
      0.16389,0.29343,0.17116,0.11426,0.32187,0.32058,0.11426,0.32187,0.32058,0.14034,0.3152,0.28552,0.14034,0.3152,0.28552,
      0.15777,0.30521,0.23305,0.15777,0.30521,0.23305,0.16389,2.99072,-0.34217,0.16389,2.99072,-0.34217,0.0835,3.0215,-0.18044,
      0.0835,3.0215,-0.18044,0.15777,3.0025,-0.28028,0.15777,3.0025,-0.28028,0.14034,3.01248,-0.22781,0.14034,3.01248,-0.22781,
      0.11426,3.01915,-0.19275,0.11426,3.01915,-0.19275,-0.1401,0.19872,-0.32653,-0.07138,0.31368,0.27754,-0.1401,0.28548,0.12939,
      -0.09768,0.31153,0.26626,-0.11997,0.30542,0.23415,-0.13487,0.29627,0.18608,-0.0,0.31368,0.27754,0.1401,0.19872,-0.32653,
      0.07138,0.31368,0.27754,0.1401,0.28548,0.12939,0.09768,0.31153,0.26626,0.11997,0.30542,0.23415,0.13487,0.29627,0.18608,
      -0.13891,2.896,-0.83986,-0.13891,2.98328,-0.38124,-0.07077,3.01165,-0.2322,-0.13372,2.99414,-0.3242,-0.11895,3.00334,-0.27585,
      -0.09684,3.00949,-0.24354,0.0,3.01165,-0.2322,0.13891,2.896,-0.83986,0.13891,2.98328,-0.38124,0.07077,3.01165,-0.2322,
      0.13372,2.99414,-0.3242,0.11895,3.00334,-0.27585,0.09684,3.00949,-0.24354
    ],
    [
      6,14,2,6,2,0,25,26,16,25,16,4,14,6,12,
      14,12,18,18,12,10,18,10,20,20,10,8,20,8,22,
      22,8,4,22,4,16,35,29,31,35,31,43,25,33,45,
      25,45,26,43,47,41,43,41,35,47,49,39,47,39,41,
      49,51,37,49,37,39,36,32,60,36,60,62,24,5,53,
      24,53,58,38,36,62,38,62,63,40,38,63,40,63,64,
      7,1,52,7,52,54,34,40,64,34,64,61,5,9,55,
      5,55,53,9,11,56,9,56,55,32,24,58,32,58,60,
      11,13,57,11,57,56,13,7,54,13,54,57,28,34,61,
      28,61,59,48,46,75,48,75,76,23,17,67,23,67,70,
      27,44,74,27,74,71,15,19,68,15,68,66,21,23,70,
      21,70,69,19,21,69,19,69,68,42,30,72,42,72,73,
      17,27,71,17,71,67,44,50,77,44,77,74,46,42,73,
      46,73,75,50,48,76,50,76,77,3,15,66,3,66,65,
      65,66,68,68,69,70,70,67,71,71,74,77,77,76,75,
      75,73,72,72,65,68,68,70,71,71,77,75,75,72,68,
      68,71,75,51,45,33,51,33,37
    ],
  ],
  [
    [
      -0.1401,0.19872,-0.32653,-0.07138,0.31368,0.27754,-0.1401,0.28548,0.12939,-0.09768,0.31153,0.26626,-0.11997,0.30542,0.23415,
      -0.13487,0.29627,0.18608,-0.0,0.31368,0.27754,0.1401,0.19872,-0.32653,0.07138,0.31368,0.27754,0.1401,0.28548,0.12939,
      0.09768,0.31153,0.26626,0.11997,0.30542,0.23415,0.13487,0.29627,0.18608,-0.1401,-0.00647,-0.27342,-0.07138,0.00624,0.33474,
      -0.1401,0.00312,0.18558,-0.09768,0.006,0.32339,-0.11997,0.00532,0.29105,-0.13487,0.00431,0.24266,0.1401,-0.00647,-0.27342,
      0.07138,0.00624,0.33474,0.1401,0.00312,0.18558,0.09768,0.006,0.32339,0.11997,0.00532,0.29105,0.13487,0.00431,0.24266,
      -0.11997,0.07889,0.2771,-0.13487,0.07588,0.22879,0.11997,0.07889,0.2771,0.09768,0.0809,0.30938,-0.1401,0.07234,0.17181,
      -0.1401,0.04383,-0.28644,-0.09768,0.0809,0.30938,0.07138,0.0816,0.32072,0.1401,0.07234,0.17181,0.13487,0.07588,0.22879,
      -0.07138,0.0816,0.32072,-0.0,0.0816,0.32072,0.1401,0.04383,-0.28644
    ],
    [
      25,26,18,25,18,17,27,28,22,27,22,23,29,30,13,
      29,13,15,31,25,17,31,17,16,28,32,20,28,20,22,
      33,34,24,33,24,21,35,31,16,35,16,14,26,29,15,
      26,15,18,34,27,23,34,23,24,37,33,21,37,21,19,
      7,9,33,7,33,37,6,1,35,6,35,36,12,11,27,
      12,27,34,5,2,29,5,29,26,8,6,36,8,36,32,
      1,3,31,1,31,35,9,12,34,9,34,33,10,8,32,
      10,32,28,3,4,25,3,25,31,2,0,30,2,30,29,
      11,10,28,11,28,27,4,5,26,4,26,25
    ],
  ],
  [
    [
      -0.07138,0.00624,0.33474,-0.07138,0.00624,0.33474,-0.0,0.00624,0.33474,0.07138,0.00624,0.33474,0.07138,0.00624,0.33474,
      0.07138,0.0816,0.32072,0.07138,0.0816,0.32072,-0.07138,0.0816,0.32072,-0.07138,0.0816,0.32072,-0.0,0.0816,0.32072,
      -0.0,0.00696,0.36941,-0.0,0.00696,0.36941,-0.06173,0.00696,0.36941,-0.06173,0.00696,0.36941,-0.06173,0.00696,0.36941,
      0.06173,0.00696,0.36941,0.06173,0.00696,0.36941,0.06173,0.00696,0.36941,0.06173,0.07355,0.35725,0.06173,0.07355,0.35725,
      0.06173,0.07355,0.35725,-0.0,0.07355,0.35725,-0.0,0.07355,0.35725,-0.06173,0.07355,0.35725,-0.06173,0.07355,0.35725,
      -0.06173,0.07355,0.35725
    ],
    [
      2,3,15,2,15,10,9,8,25,9,25,22,18,21,11,
      18,11,16,21,24,14,21,14,11,4,6,20,4,20,17,
      7,0,12,7,12,23,5,9,22,5,22,19,1,2,10,
      1,10,13
    ],
  ],
];
