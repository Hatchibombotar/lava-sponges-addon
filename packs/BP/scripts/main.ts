import { type Block, BlockPermutation, system, world } from "@minecraft/server"

function tryTriggerLavaSponge(block: Block) {
    if (!block.hasTag("hatchi:lava_sponge")) {
        return
    }
    // TODO: change to a better way of detecting lava once that exists in stable
    const should_trigger = block.below(1)?.isLiquid || block.above(1)?.isLiquid || block.north(1)?.isLiquid || block.east(1)?.isLiquid || block.south(1)?.isLiquid || block.west(1)?.isLiquid
    if (!should_trigger) {
        return
    }


    let replace_with_block = "hatchi:lava_sponge_molten"
    let sponge_range = 2
    if (block.hasTag("hatchi:compressed_x4")) {
        replace_with_block = "hatchi:lava_sponge_compressed_x4_molten"
        sponge_range = 4
    } else if (block.hasTag("hatchi:compressed_x16")) {
        replace_with_block = "hatchi:lava_sponge_compressed_x16_molten"
        sponge_range = 8
    }

    const { x, y, z } = block.location

    const area = `${x + sponge_range} ${y + sponge_range} ${z + sponge_range} ${x - sponge_range} ${y - sponge_range} ${z - sponge_range}`

    block.dimension.runCommand(`fill ${area} air replace lava`)
    block.dimension.runCommand(`fill ${area} air replace flowing_lava`)
    block.dimension.runCommand(`particle hatchi:dry ${x} ${y} ${z}`)
    block.dimension.runCommand(`playsound random.fizz @a ${x} ${y} ${z} 10 0.5`)

    block.setPermutation(BlockPermutation.resolve(replace_with_block))
}
world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
    tryTriggerLavaSponge(block)
})
world.beforeEvents.itemUseOn.subscribe(({ block, itemStack }) => {
    if (block.hasTag("hatchi:lava_sponge_molten") && itemStack.getTags().includes("minecraft:is_axe")) {

        const { x, y, z } = block.location

        let replace_with_block = "hatchi:lava_sponge"
        if (block.hasTag("hatchi:compressed_x4")) {
            replace_with_block = "hatchi:lava_sponge_compressed_x4"
        } else if (block.hasTag("hatchi:compressed_x16")) {
            replace_with_block = "hatchi:lava_sponge_compressed_x16"
        }

        system.run(() => {

            block.setPermutation(BlockPermutation.resolve(replace_with_block))

            block.dimension.runCommand(`particle hatchi:scrape ${x} ${y} ${z}`)
            block.dimension.runCommand(`playsound block.beehive.shear @a ${x} ${y} ${z}`)

            system.run(() => {
                tryTriggerLavaSponge(block)
            })

        })

    }
})