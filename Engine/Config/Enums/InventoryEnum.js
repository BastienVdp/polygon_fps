import { WeaponEnum } from "./WeaponEnum";

export const InventoryEnum = 
{
	HANDS: "HANDS",
	PRIMARY: "PRIMARY",
	SECONDARY: "SECONDARY",
	MELEE: "MELEE",
};

export function mapIventorySlotByWeaponClassificationEnum(weapon) 
{
    switch (weapon) {
        case WeaponEnum.RIFLE:
            return InventoryEnum.PRIMARY;
        case WeaponEnum.SNIPER:
            return InventoryEnum.PRIMARY;
        case WeaponEnum.PISTOL:
            return InventoryEnum.SECONDARY;
        case WeaponEnum.MELEE:
            return InventoryEnum.MELEE;
        case WeaponEnum.SMG:
            return InventoryEnum.PRIMARY;
        case WeaponEnum.SHOTGUN:
            return InventoryEnum.PRIMARY;
        case WeaponEnum.MACHINEGUN:
            return InventoryEnum.PRIMARY;
    }
}