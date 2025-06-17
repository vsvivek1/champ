import { placeTargetsForLiveScripts } from './placeTargetsForLiveScripts';
import Margin from '@/components/Margin.vue';
import ClosedTrades from "./ClosedTrades.vue";
import LiveOrders from "./LiveOrders.vue";
import LivePos from "./LivePos.vue";
import IndicesTable from "./IndicesTable.vue";
import { __VLS_internalComponent, __VLS_componentsOption, __VLS_name, instruments } from './NewFutureMining.vue';

function __VLS_template() {
let __VLS_ctx!: InstanceType<__VLS_PickNotAny<typeof __VLS_internalComponent, new () => {}>> & {};
/* Components */
let __VLS_otherComponents!: NonNullable<typeof __VLS_internalComponent extends { components: infer C; } ? C : {}> & typeof __VLS_componentsOption;
let __VLS_own!: __VLS_SelfComponent<typeof __VLS_name, typeof __VLS_internalComponent & (new () => { $scopedSlots: typeof __VLS_slots; })>;
let __VLS_localComponents!: typeof __VLS_otherComponents & Omit<typeof __VLS_own, keyof typeof __VLS_otherComponents>;
let __VLS_components!: typeof __VLS_localComponents & __VLS_GlobalComponents & typeof __VLS_ctx;
/* Style Scoped */
type __VLS_StyleScopedClasses = {} &
{ 'fixTableHead'?: boolean; } &
{ 'fixTableHead'?: boolean; };
let __VLS_styleScopedClasses!: __VLS_StyleScopedClasses | keyof __VLS_StyleScopedClasses | (keyof __VLS_StyleScopedClasses)[];
/* CSS variable injection */
/* CSS variable injection end */
let __VLS_resolvedLocalAndGlobalComponents!: {} &
__VLS_WithComponent<'VBtn', typeof __VLS_localComponents, "VBtn", "vBtn", "button"> &
__VLS_WithComponent<'VAlert', typeof __VLS_localComponents, "VAlert", "vAlert", "v-alert"> &
__VLS_WithComponent<'VRow', typeof __VLS_localComponents, "VRow", "vRow", "v-row"> &
__VLS_WithComponent<'VCol', typeof __VLS_localComponents, "VCol", "vCol", "v-col"> &
__VLS_WithComponent<'VIcon', typeof __VLS_localComponents, "VIcon", "vIcon", "span"> &
__VLS_WithComponent<'IndicesTable', typeof __VLS_localComponents, "IndicesTable", "IndicesTable", "IndicesTable"> &
__VLS_WithComponent<'VChip', typeof __VLS_localComponents, "VChip", "vChip", "v-chip"> &
__VLS_WithComponent<'ClosedTrades', typeof __VLS_localComponents, "ClosedTrades", "ClosedTrades", "ClosedTrades"> &
__VLS_WithComponent<'Margin', typeof __VLS_localComponents, "Margin", "Margin", "Margin"> &
__VLS_WithComponent<'VDialog', typeof __VLS_localComponents, "VDialog", "vDialog", "v-dialog"> &
__VLS_WithComponent<'LivePos', typeof __VLS_localComponents, "LivePos", "LivePos", "LivePos"> &
__VLS_WithComponent<'LiveOrders', typeof __VLS_localComponents, "LiveOrders", "LiveOrders", "LiveOrders">;
__VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div; __VLS_intrinsicElements.div;
__VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.VBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components.vBtn; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"]; __VLS_components["button"];
// @ts-ignore
[VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn, VBtn,];
__VLS_intrinsicElements.p; __VLS_intrinsicElements.p; __VLS_intrinsicElements.p; __VLS_intrinsicElements.p; __VLS_intrinsicElements.p; __VLS_intrinsicElements.p;
__VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.VAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components.vAlert; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"]; __VLS_components["v-alert"];
// @ts-ignore
[VAlert, VAlert, VAlert, VAlert, VAlert, VAlert, VAlert, VAlert, VAlert, VAlert,];
__VLS_intrinsicElements.button; __VLS_intrinsicElements.button; __VLS_intrinsicElements.button; __VLS_intrinsicElements.button; __VLS_intrinsicElements.button; __VLS_intrinsicElements.button;
__VLS_intrinsicElements.ul; __VLS_intrinsicElements.ul; __VLS_intrinsicElements.ul; __VLS_intrinsicElements.ul;
__VLS_intrinsicElements.li; __VLS_intrinsicElements.li; __VLS_intrinsicElements.li; __VLS_intrinsicElements.li;
__VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.VRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components.vRow; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"]; __VLS_components["v-row"];
// @ts-ignore
[VRow, VRow, VRow, VRow, VRow, VRow, VRow, VRow, VRow, VRow,];
__VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.VCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components.vCol; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"]; __VLS_components["v-col"];
// @ts-ignore
[VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol, VCol,];
__VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.VIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components.vIcon; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"]; __VLS_components["span"];
// @ts-ignore
[VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon, VIcon,];
__VLS_components.IndicesTable; __VLS_components.IndicesTable;
// @ts-ignore
[IndicesTable, IndicesTable,];
__VLS_intrinsicElements.label; __VLS_intrinsicElements.label;
__VLS_intrinsicElements.input; __VLS_intrinsicElements.input; __VLS_intrinsicElements.input;
__VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.VChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components.vChip; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"]; __VLS_components["v-chip"];
// @ts-ignore
[VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip, VChip,];
__VLS_intrinsicElements.img;
__VLS_components.ClosedTrades; __VLS_components.ClosedTrades;
// @ts-ignore
[ClosedTrades, ClosedTrades,];
__VLS_components.Margin; __VLS_components.Margin;
// @ts-ignore
[Margin, Margin,];
__VLS_components.VDialog; __VLS_components.VDialog; __VLS_components.vDialog; __VLS_components.vDialog; __VLS_components["v-dialog"]; __VLS_components["v-dialog"];
// @ts-ignore
[VDialog, VDialog,];
__VLS_intrinsicElements.table; __VLS_intrinsicElements.table; __VLS_intrinsicElements.table; __VLS_intrinsicElements.table;
__VLS_intrinsicElements.tr; __VLS_intrinsicElements.tr; __VLS_intrinsicElements.tr; __VLS_intrinsicElements.tr;
__VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td; __VLS_intrinsicElements.td;
__VLS_intrinsicElements.h1; __VLS_intrinsicElements.h1;
__VLS_components.LivePos; __VLS_components.LivePos;
// @ts-ignore
[LivePos, LivePos,];
__VLS_components.LiveOrders; __VLS_components.LiveOrders;
// @ts-ignore
[LiveOrders, LiveOrders,];
__VLS_intrinsicElements.thead; __VLS_intrinsicElements.thead;
__VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th; __VLS_intrinsicElements.th;
__VLS_intrinsicElements.tbody; __VLS_intrinsicElements.tbody;
__VLS_intrinsicElements.small; __VLS_intrinsicElements.small; __VLS_intrinsicElements.small; __VLS_intrinsicElements.small; __VLS_intrinsicElements.small; __VLS_intrinsicElements.small; __VLS_intrinsicElements.small; __VLS_intrinsicElements.small;
__VLS_intrinsicElements.a; __VLS_intrinsicElements.a;
__VLS_intrinsicElements.select; __VLS_intrinsicElements.select;
__VLS_intrinsicElements.option; __VLS_intrinsicElements.option;
__VLS_intrinsicElements.hr;
{
const __VLS_0 = __VLS_intrinsicElements["div"];
const __VLS_1 = __VLS_elementAsFunctionalComponent(__VLS_0);
const __VLS_2 = __VLS_1({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_0, typeof __VLS_2> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_3 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2)!;
let __VLS_4!: __VLS_NormalizeEmits<typeof __VLS_3.emit>;
{
const __VLS_5 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({ ...{ onClick: {} as any, }, color: ("red"), prominent: (true), }));
({} as { VBtn: typeof __VLS_5; }).VBtn;
({} as { VBtn: typeof __VLS_5; }).VBtn;
const __VLS_7 = __VLS_6({ ...{ onClick: {} as any, }, color: ("red"), prominent: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_6));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_5, typeof __VLS_7> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, color: ("red"), prominent: (true), });
const __VLS_8 = __VLS_pickFunctionalComponentCtx(__VLS_5, __VLS_7)!;
let __VLS_9!: __VLS_NormalizeEmits<typeof __VLS_8.emit>;
let __VLS_10 = { 'click': __VLS_pickEvent(__VLS_9['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_6, typeof __VLS_7>).onClick) };
__VLS_10 = {
click: $event => {
__VLS_ctx.exitPositions();
// @ts-ignore
[exitPositions,];
}
};
(__VLS_8.slots!).default;
}
if (__VLS_ctx.liveMargin && __VLS_ctx.liveMargin.equity && __VLS_ctx.liveMargin.equity.utilised && __VLS_ctx.liveMargin.equity.utilised.debits) {
{
const __VLS_11 = __VLS_intrinsicElements["p"];
const __VLS_12 = __VLS_elementAsFunctionalComponent(__VLS_11);
const __VLS_13 = __VLS_12({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_12));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_11, typeof __VLS_13> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_14 = __VLS_pickFunctionalComponentCtx(__VLS_11, __VLS_13)!;
let __VLS_15!: __VLS_NormalizeEmits<typeof __VLS_14.emit>;
if (__VLS_ctx.checkSidewaysMovementTime()) {
{
const __VLS_16 = ({} as 'VAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.VAlert; } : 'vAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.vAlert; } : 'v-alert' extends keyof typeof __VLS_ctx ? { 'VAlert': (typeof __VLS_ctx)["v-alert"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VAlert;
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ ...{}, color: ("red"), }));
({} as { VAlert: typeof __VLS_16; }).VAlert;
({} as { VAlert: typeof __VLS_16; }).VAlert;
const __VLS_18 = __VLS_17({ ...{}, color: ("red"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_16, typeof __VLS_18> & Record<string, unknown>) => void)({ ...{}, color: ("red"), });
const __VLS_19 = __VLS_pickFunctionalComponentCtx(__VLS_16, __VLS_18)!;
let __VLS_20!: __VLS_NormalizeEmits<typeof __VLS_19.emit>;
(__VLS_19.slots!).default;
}
// @ts-ignore
[liveMargin, liveMargin, liveMargin, liveMargin, checkSidewaysMovementTime,];
}
if (!__VLS_ctx.checkSidewaysMovementTime()) {
{
const __VLS_21 = ({} as 'VAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.VAlert; } : 'vAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.vAlert; } : 'v-alert' extends keyof typeof __VLS_ctx ? { 'VAlert': (typeof __VLS_ctx)["v-alert"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VAlert;
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ ...{}, color: ("green"), }));
({} as { VAlert: typeof __VLS_21; }).VAlert;
({} as { VAlert: typeof __VLS_21; }).VAlert;
const __VLS_23 = __VLS_22({ ...{}, color: ("green"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_21, typeof __VLS_23> & Record<string, unknown>) => void)({ ...{}, color: ("green"), });
const __VLS_24 = __VLS_pickFunctionalComponentCtx(__VLS_21, __VLS_23)!;
let __VLS_25!: __VLS_NormalizeEmits<typeof __VLS_24.emit>;
(__VLS_24.slots!).default;
}
// @ts-ignore
[checkSidewaysMovementTime,];
}
(__VLS_ctx.liveMargin.equity.utilised.margin);
(__VLS_ctx.totalOptionPrice);
(__VLS_ctx.liveMargin.equity.utilised.option_premium);
(__VLS_14.slots!).default;
}
// @ts-ignore
[liveMargin, totalOptionPrice, liveMargin,];
}
else {
{
const __VLS_26 = __VLS_intrinsicElements["p"];
const __VLS_27 = __VLS_elementAsFunctionalComponent(__VLS_26);
const __VLS_28 = __VLS_27({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_27));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_26, typeof __VLS_28> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_29 = __VLS_pickFunctionalComponentCtx(__VLS_26, __VLS_28)!;
let __VLS_30!: __VLS_NormalizeEmits<typeof __VLS_29.emit>;
(__VLS_29.slots!).default;
}
}
{
const __VLS_31 = __VLS_intrinsicElements["button"];
const __VLS_32 = __VLS_elementAsFunctionalComponent(__VLS_31);
const __VLS_33 = __VLS_32({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_32));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_31, typeof __VLS_33> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_34 = __VLS_pickFunctionalComponentCtx(__VLS_31, __VLS_33)!;
let __VLS_35!: __VLS_NormalizeEmits<typeof __VLS_34.emit>;
let __VLS_36 = { 'click': __VLS_pickEvent(__VLS_35['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_32, typeof __VLS_33>).onClick) };
__VLS_36 = {
click: $event => {
__VLS_ctx.openWindow();
// @ts-ignore
[openWindow,];
}
};
(__VLS_34.slots!).default;
}
{
const __VLS_37 = __VLS_intrinsicElements["button"];
const __VLS_38 = __VLS_elementAsFunctionalComponent(__VLS_37);
const __VLS_39 = __VLS_38({ ...{}, class: ("btn-primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_37, typeof __VLS_39> & Record<string, unknown>) => void)({ ...{}, class: ("btn-primary"), });
const __VLS_40 = __VLS_pickFunctionalComponentCtx(__VLS_37, __VLS_39)!;
let __VLS_41!: __VLS_NormalizeEmits<typeof __VLS_40.emit>;
(__VLS_40.slots!).default;
}
if (__VLS_ctx.logs.length && __VLS_ctx.viewLogs) {
{
const __VLS_42 = __VLS_intrinsicElements["p"];
const __VLS_43 = __VLS_elementAsFunctionalComponent(__VLS_42);
const __VLS_44 = __VLS_43({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_43));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_42, typeof __VLS_44> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_45 = __VLS_pickFunctionalComponentCtx(__VLS_42, __VLS_44)!;
let __VLS_46!: __VLS_NormalizeEmits<typeof __VLS_45.emit>;
(__VLS_45.slots!).default;
}
// @ts-ignore
[logs, viewLogs,];
}
if (__VLS_ctx.viewLogs) {
{
const __VLS_47 = __VLS_intrinsicElements["ul"];
const __VLS_48 = __VLS_elementAsFunctionalComponent(__VLS_47);
const __VLS_49 = __VLS_48({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_48));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_47, typeof __VLS_49> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_50 = __VLS_pickFunctionalComponentCtx(__VLS_47, __VLS_49)!;
let __VLS_51!: __VLS_NormalizeEmits<typeof __VLS_50.emit>;
for (const [log] of __VLS_getVForSourceType((__VLS_ctx.logs)!)) {
{
const __VLS_52 = __VLS_intrinsicElements["li"];
const __VLS_53 = __VLS_elementAsFunctionalComponent(__VLS_52);
const __VLS_54 = __VLS_53({ ...{}, key: ((log)), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_52, typeof __VLS_54> & Record<string, unknown>) => void)({ ...{}, key: ((log)), });
const __VLS_55 = __VLS_pickFunctionalComponentCtx(__VLS_52, __VLS_54)!;
let __VLS_56!: __VLS_NormalizeEmits<typeof __VLS_55.emit>;
(log);
(__VLS_55.slots!).default;
}
// @ts-ignore
[viewLogs, logs,];
}
(__VLS_50.slots!).default;
}
}
(__VLS_ctx.instruments.length);
(__VLS_ctx.tradeEntryFlowStatus);
(__VLS_ctx.instruments.length);
if (__VLS_ctx.instruments.length != 0 && __VLS_ctx.instruments[0] &&
__VLS_ctx.instruments[0].pricePoints &&
__VLS_ctx.instruments[0].pricePoints.d1) {
{
const __VLS_57 = ({} as 'VRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.VRow; } : 'vRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.vRow; } : 'v-row' extends keyof typeof __VLS_ctx ? { 'VRow': (typeof __VLS_ctx)["v-row"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VRow;
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ ...{}, }));
({} as { VRow: typeof __VLS_57; }).VRow;
({} as { VRow: typeof __VLS_57; }).VRow;
const __VLS_59 = __VLS_58({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_58));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_57, typeof __VLS_59> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_60 = __VLS_pickFunctionalComponentCtx(__VLS_57, __VLS_59)!;
let __VLS_61!: __VLS_NormalizeEmits<typeof __VLS_60.emit>;
{
const __VLS_62 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ ...{}, }));
({} as { VCol: typeof __VLS_62; }).VCol;
({} as { VCol: typeof __VLS_62; }).VCol;
const __VLS_64 = __VLS_63({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_63));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_62, typeof __VLS_64> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_65 = __VLS_pickFunctionalComponentCtx(__VLS_62, __VLS_64)!;
let __VLS_66!: __VLS_NormalizeEmits<typeof __VLS_65.emit>;
(__VLS_ctx.instruments[0].tradingsymbol);
(__VLS_ctx.instruments[0].pricePoints.d1.normalDate);
(__VLS_65.slots!).default;
}
{
const __VLS_67 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ ...{}, }));
({} as { VCol: typeof __VLS_67; }).VCol;
({} as { VCol: typeof __VLS_67; }).VCol;
const __VLS_69 = __VLS_68({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_68));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_67, typeof __VLS_69> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_70 = __VLS_pickFunctionalComponentCtx(__VLS_67, __VLS_69)!;
let __VLS_71!: __VLS_NormalizeEmits<typeof __VLS_70.emit>;
(__VLS_ctx.instruments[0].pricePoints.d2.normalDate);
(__VLS_ctx.stopLossSwitchHealth);
(__VLS_ctx.tradeEntrySwitchHealth);
(__VLS_70.slots!).default;
}
(__VLS_60.slots!).default;
}
// @ts-ignore
[instruments, tradeEntryFlowStatus, instruments, instruments, instruments, instruments, instruments, instruments, instruments, instruments, stopLossSwitchHealth, tradeEntrySwitchHealth,];
}
{
const __VLS_72 = ({} as 'VRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.VRow; } : 'vRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.vRow; } : 'v-row' extends keyof typeof __VLS_ctx ? { 'VRow': (typeof __VLS_ctx)["v-row"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VRow;
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ ...{}, }));
({} as { VRow: typeof __VLS_72; }).VRow;
({} as { VRow: typeof __VLS_72; }).VRow;
const __VLS_74 = __VLS_73({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_73));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_72, typeof __VLS_74> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_75 = __VLS_pickFunctionalComponentCtx(__VLS_72, __VLS_74)!;
let __VLS_76!: __VLS_NormalizeEmits<typeof __VLS_75.emit>;
{
const __VLS_77 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
...{}, class: (({
'text-danger': __VLS_ctx.stopLossSwitchHealth,
'text-primary': !__VLS_ctx.stopLossSwitchHealth,
})), title: ("if This symbol changes color switches between red and blue system is conencted to market"),
}));
({} as { VIcon: typeof __VLS_77; }).VIcon;
({} as { VIcon: typeof __VLS_77; }).VIcon;
const __VLS_79 = __VLS_78({
...{}, class: (({
'text-danger': __VLS_ctx.stopLossSwitchHealth,
'text-primary': !__VLS_ctx.stopLossSwitchHealth,
})), title: ("if This symbol changes color switches between red and blue system is conencted to market"),
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_77, typeof __VLS_79> & Record<string, unknown>) => void)({
...{}, class: (({
'text-danger': __VLS_ctx.stopLossSwitchHealth,
'text-primary': !__VLS_ctx.stopLossSwitchHealth,
})), title: ("if This symbol changes color switches between red and blue system is conencted to market"),
});
const __VLS_80 = __VLS_pickFunctionalComponentCtx(__VLS_77, __VLS_79)!;
let __VLS_81!: __VLS_NormalizeEmits<typeof __VLS_80.emit>;
__VLS_styleScopedClasses = ({
'text-danger': stopLossSwitchHealth,
'text-primary': !stopLossSwitchHealth,
});
(__VLS_80.slots!).default;
}
{
const __VLS_82 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
...{}, class: (({
'text-primary': __VLS_ctx.tradeEntrySwitchHealth,
'text-secondary': !__VLS_ctx.tradeEntrySwitchHealth,
})), title: ("if This symbol changes color switches between red and blue system is conencted to market"),
}));
({} as { VIcon: typeof __VLS_82; }).VIcon;
({} as { VIcon: typeof __VLS_82; }).VIcon;
const __VLS_84 = __VLS_83({
...{}, class: (({
'text-primary': __VLS_ctx.tradeEntrySwitchHealth,
'text-secondary': !__VLS_ctx.tradeEntrySwitchHealth,
})), title: ("if This symbol changes color switches between red and blue system is conencted to market"),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_82, typeof __VLS_84> & Record<string, unknown>) => void)({
...{}, class: (({
'text-primary': __VLS_ctx.tradeEntrySwitchHealth,
'text-secondary': !__VLS_ctx.tradeEntrySwitchHealth,
})), title: ("if This symbol changes color switches between red and blue system is conencted to market"),
});
const __VLS_85 = __VLS_pickFunctionalComponentCtx(__VLS_82, __VLS_84)!;
let __VLS_86!: __VLS_NormalizeEmits<typeof __VLS_85.emit>;
__VLS_styleScopedClasses = ({
'text-primary': tradeEntrySwitchHealth,
'text-secondary': !tradeEntrySwitchHealth,
});
(__VLS_85.slots!).default;
}
{
const __VLS_87 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({ ...{}, class: (({ 'text-success': __VLS_ctx.heartBeat })), title: ("if This symbol changes color switches between red and blue system is conencted to market"), }));
({} as { VIcon: typeof __VLS_87; }).VIcon;
({} as { VIcon: typeof __VLS_87; }).VIcon;
const __VLS_89 = __VLS_88({ ...{}, class: (({ 'text-success': __VLS_ctx.heartBeat })), title: ("if This symbol changes color switches between red and blue system is conencted to market"), }, ...__VLS_functionalComponentArgsRest(__VLS_88));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_87, typeof __VLS_89> & Record<string, unknown>) => void)({ ...{}, class: (({ 'text-success': __VLS_ctx.heartBeat })), title: ("if This symbol changes color switches between red and blue system is conencted to market"), });
const __VLS_90 = __VLS_pickFunctionalComponentCtx(__VLS_87, __VLS_89)!;
let __VLS_91!: __VLS_NormalizeEmits<typeof __VLS_90.emit>;
__VLS_styleScopedClasses = ({ 'text-success': heartBeat });
(__VLS_90.slots!).default;
}
(__VLS_75.slots!).default;
}
(__VLS_ctx.globalConsoleLogs.length);
{
const __VLS_92 = ({} as 'VAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.VAlert; } : 'vAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.vAlert; } : 'v-alert' extends keyof typeof __VLS_ctx ? { 'VAlert': (typeof __VLS_ctx)["v-alert"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VAlert;
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ ...{}, }));
({} as { VAlert: typeof __VLS_92; }).VAlert;
({} as { VAlert: typeof __VLS_92; }).VAlert;
const __VLS_94 = __VLS_93({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_93));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_92, typeof __VLS_94> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_95 = __VLS_pickFunctionalComponentCtx(__VLS_92, __VLS_94)!;
let __VLS_96!: __VLS_NormalizeEmits<typeof __VLS_95.emit>;
{
const __VLS_97 = ({} as 'IndicesTable' extends keyof typeof __VLS_ctx ? { 'IndicesTable': typeof __VLS_ctx.IndicesTable; } : typeof __VLS_resolvedLocalAndGlobalComponents).IndicesTable;
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({ ...{}, indices: ((__VLS_ctx.indices)), }));
({} as { IndicesTable: typeof __VLS_97; }).IndicesTable;
({} as { IndicesTable: typeof __VLS_97; }).IndicesTable;
const __VLS_99 = __VLS_98({ ...{}, indices: ((__VLS_ctx.indices)), }, ...__VLS_functionalComponentArgsRest(__VLS_98));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_97, typeof __VLS_99> & Record<string, unknown>) => void)({ ...{}, indices: ((__VLS_ctx.indices)), });
const __VLS_100 = __VLS_pickFunctionalComponentCtx(__VLS_97, __VLS_99)!;
let __VLS_101!: __VLS_NormalizeEmits<typeof __VLS_100.emit>;
}
{
const __VLS_102 = __VLS_intrinsicElements["label"];
const __VLS_103 = __VLS_elementAsFunctionalComponent(__VLS_102);
const __VLS_104 = __VLS_103({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_103));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_102, typeof __VLS_104> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_105 = __VLS_pickFunctionalComponentCtx(__VLS_102, __VLS_104)!;
let __VLS_106!: __VLS_NormalizeEmits<typeof __VLS_105.emit>;
{
const __VLS_107 = __VLS_intrinsicElements["input"];
const __VLS_108 = __VLS_elementAsFunctionalComponent(__VLS_107);
const __VLS_109 = __VLS_108({ ...{}, type: ("checkbox"), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_107, typeof __VLS_109> & Record<string, unknown>) => void)({ ...{}, type: ("checkbox"), });
const __VLS_110 = __VLS_pickFunctionalComponentCtx(__VLS_107, __VLS_109)!;
let __VLS_111!: __VLS_NormalizeEmits<typeof __VLS_110.emit>;
(__VLS_ctx.showLogs);
}
(__VLS_105.slots!).default;
}
{
const __VLS_112 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ ...{}, color: ("green"), title: ("Current Check Digit"), }));
({} as { VChip: typeof __VLS_112; }).VChip;
({} as { VChip: typeof __VLS_112; }).VChip;
const __VLS_114 = __VLS_113({ ...{}, color: ("green"), title: ("Current Check Digit"), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_112, typeof __VLS_114> & Record<string, unknown>) => void)({ ...{}, color: ("green"), title: ("Current Check Digit"), });
const __VLS_115 = __VLS_pickFunctionalComponentCtx(__VLS_112, __VLS_114)!;
let __VLS_116!: __VLS_NormalizeEmits<typeof __VLS_115.emit>;
(__VLS_ctx.CurrentCheckDigit);
(__VLS_115.slots!).default;
}
{
const __VLS_117 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({ ...{}, color: ("red"), title: ("Lagging Check Digit"), }));
({} as { VChip: typeof __VLS_117; }).VChip;
({} as { VChip: typeof __VLS_117; }).VChip;
const __VLS_119 = __VLS_118({ ...{}, color: ("red"), title: ("Lagging Check Digit"), }, ...__VLS_functionalComponentArgsRest(__VLS_118));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_117, typeof __VLS_119> & Record<string, unknown>) => void)({ ...{}, color: ("red"), title: ("Lagging Check Digit"), });
const __VLS_120 = __VLS_pickFunctionalComponentCtx(__VLS_117, __VLS_119)!;
let __VLS_121!: __VLS_NormalizeEmits<typeof __VLS_120.emit>;
(
__VLS_ctx.laggingCheckDigit
);
(__VLS_120.slots!).default;
}
if (__VLS_ctx.webSocketNotActive) {
{
const __VLS_122 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({ ...{}, color: ("orange"), }));
({} as { VChip: typeof __VLS_122; }).VChip;
({} as { VChip: typeof __VLS_122; }).VChip;
const __VLS_124 = __VLS_123({ ...{}, color: ("orange"), }, ...__VLS_functionalComponentArgsRest(__VLS_123));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_122, typeof __VLS_124> & Record<string, unknown>) => void)({ ...{}, color: ("orange"), });
const __VLS_125 = __VLS_pickFunctionalComponentCtx(__VLS_122, __VLS_124)!;
let __VLS_126!: __VLS_NormalizeEmits<typeof __VLS_125.emit>;
(__VLS_125.slots!).default;
}
// @ts-ignore
[stopLossSwitchHealth, stopLossSwitchHealth, stopLossSwitchHealth, stopLossSwitchHealth, stopLossSwitchHealth, stopLossSwitchHealth, tradeEntrySwitchHealth, tradeEntrySwitchHealth, tradeEntrySwitchHealth, tradeEntrySwitchHealth, tradeEntrySwitchHealth, tradeEntrySwitchHealth, heartBeat, heartBeat, heartBeat, globalConsoleLogs, indices, indices, indices, showLogs, CurrentCheckDigit, laggingCheckDigit, webSocketNotActive,];
}
{
const __VLS_127 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({ ...{ onClick: {} as any, }, }));
({} as { VBtn: typeof __VLS_127; }).VBtn;
({} as { VBtn: typeof __VLS_127; }).VBtn;
const __VLS_129 = __VLS_128({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_128));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_127, typeof __VLS_129> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_130 = __VLS_pickFunctionalComponentCtx(__VLS_127, __VLS_129)!;
let __VLS_131!: __VLS_NormalizeEmits<typeof __VLS_130.emit>;
let __VLS_132 = { 'click': __VLS_pickEvent(__VLS_131['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_128, typeof __VLS_129>).onClick) };
__VLS_132 = {
click: $event => {
__VLS_ctx.trailingStopLossWithLtp();
// @ts-ignore
[trailingStopLossWithLtp,];
}
};
(__VLS_130.slots!).default;
}
{
const __VLS_133 = ({} as 'VRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.VRow; } : 'vRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.vRow; } : 'v-row' extends keyof typeof __VLS_ctx ? { 'VRow': (typeof __VLS_ctx)["v-row"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VRow;
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({ ...{}, class: ("mt-1"), }));
({} as { VRow: typeof __VLS_133; }).VRow;
({} as { VRow: typeof __VLS_133; }).VRow;
const __VLS_135 = __VLS_134({ ...{}, class: ("mt-1"), }, ...__VLS_functionalComponentArgsRest(__VLS_134));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_133, typeof __VLS_135> & Record<string, unknown>) => void)({ ...{}, class: ("mt-1"), });
const __VLS_136 = __VLS_pickFunctionalComponentCtx(__VLS_133, __VLS_135)!;
let __VLS_137!: __VLS_NormalizeEmits<typeof __VLS_136.emit>;
{
const __VLS_138 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ ...{}, }));
({} as { VCol: typeof __VLS_138; }).VCol;
({} as { VCol: typeof __VLS_138; }).VCol;
const __VLS_140 = __VLS_139({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_139));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_138, typeof __VLS_140> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_141 = __VLS_pickFunctionalComponentCtx(__VLS_138, __VLS_140)!;
let __VLS_142!: __VLS_NormalizeEmits<typeof __VLS_141.emit>;
{
const __VLS_143 = ({} as 'VRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.VRow; } : 'vRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.vRow; } : 'v-row' extends keyof typeof __VLS_ctx ? { 'VRow': (typeof __VLS_ctx)["v-row"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VRow;
const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({ ...{}, }));
({} as { VRow: typeof __VLS_143; }).VRow;
({} as { VRow: typeof __VLS_143; }).VRow;
const __VLS_145 = __VLS_144({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_144));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_143, typeof __VLS_145> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_146 = __VLS_pickFunctionalComponentCtx(__VLS_143, __VLS_145)!;
let __VLS_147!: __VLS_NormalizeEmits<typeof __VLS_146.emit>;
{
const __VLS_148 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({ ...{}, }));
({} as { VCol: typeof __VLS_148; }).VCol;
({} as { VCol: typeof __VLS_148; }).VCol;
const __VLS_150 = __VLS_149({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_149));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_148, typeof __VLS_150> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_151 = __VLS_pickFunctionalComponentCtx(__VLS_148, __VLS_150)!;
let __VLS_152!: __VLS_NormalizeEmits<typeof __VLS_151.emit>;
{
const __VLS_153 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({ ...{}, }));
({} as { VChip: typeof __VLS_153; }).VChip;
({} as { VChip: typeof __VLS_153; }).VChip;
const __VLS_155 = __VLS_154({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_154));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_153, typeof __VLS_155> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_156 = __VLS_pickFunctionalComponentCtx(__VLS_153, __VLS_155)!;
let __VLS_157!: __VLS_NormalizeEmits<typeof __VLS_156.emit>;
(__VLS_ctx.livePositionTotalCost);
(__VLS_ctx.liveBuyOrderAmount);
(__VLS_ctx.liveTradablebalance);
(__VLS_156.slots!).default;
}
(__VLS_151.slots!).default;
}
(__VLS_146.slots!).default;
}
(__VLS_141.slots!).default;
}
{
const __VLS_158 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({ ...{}, }));
({} as { VCol: typeof __VLS_158; }).VCol;
({} as { VCol: typeof __VLS_158; }).VCol;
const __VLS_160 = __VLS_159({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_159));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_158, typeof __VLS_160> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_161 = __VLS_pickFunctionalComponentCtx(__VLS_158, __VLS_160)!;
let __VLS_162!: __VLS_NormalizeEmits<typeof __VLS_161.emit>;
{
const __VLS_163 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({ ...{}, }));
({} as { VIcon: typeof __VLS_163; }).VIcon;
({} as { VIcon: typeof __VLS_163; }).VIcon;
const __VLS_165 = __VLS_164({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_164));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_163, typeof __VLS_165> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_166 = __VLS_pickFunctionalComponentCtx(__VLS_163, __VLS_165)!;
let __VLS_167!: __VLS_NormalizeEmits<typeof __VLS_166.emit>;
}
(__VLS_161.slots!).default;
}
{
const __VLS_168 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({ ...{}, }));
({} as { VCol: typeof __VLS_168; }).VCol;
({} as { VCol: typeof __VLS_168; }).VCol;
const __VLS_170 = __VLS_169({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_169));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_168, typeof __VLS_170> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_171 = __VLS_pickFunctionalComponentCtx(__VLS_168, __VLS_170)!;
let __VLS_172!: __VLS_NormalizeEmits<typeof __VLS_171.emit>;
if (__VLS_ctx.chat_id < -1) {
{
const __VLS_173 = __VLS_intrinsicElements["img"];
const __VLS_174 = __VLS_elementAsFunctionalComponent(__VLS_173);
const __VLS_175 = __VLS_174({ ...{}, src: ("https://img.icons8.com/color/48/000000/twitter--v2.png"), }, ...__VLS_functionalComponentArgsRest(__VLS_174));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_173, typeof __VLS_175> & Record<string, unknown>) => void)({ ...{}, src: ("https://img.icons8.com/color/48/000000/twitter--v2.png"), });
const __VLS_176 = __VLS_pickFunctionalComponentCtx(__VLS_173, __VLS_175)!;
let __VLS_177!: __VLS_NormalizeEmits<typeof __VLS_176.emit>;
}
// @ts-ignore
[livePositionTotalCost, liveBuyOrderAmount, liveTradablebalance, chat_id,];
}
(__VLS_171.slots!).default;
}
{
const __VLS_178 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({ ...{}, }));
({} as { VCol: typeof __VLS_178; }).VCol;
({} as { VCol: typeof __VLS_178; }).VCol;
const __VLS_180 = __VLS_179({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_179));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_178, typeof __VLS_180> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_181 = __VLS_pickFunctionalComponentCtx(__VLS_178, __VLS_180)!;
let __VLS_182!: __VLS_NormalizeEmits<typeof __VLS_181.emit>;
{
const __VLS_183 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({ ...{}, color: ("blue"), }));
({} as { VIcon: typeof __VLS_183; }).VIcon;
({} as { VIcon: typeof __VLS_183; }).VIcon;
const __VLS_185 = __VLS_184({ ...{}, color: ("blue"), }, ...__VLS_functionalComponentArgsRest(__VLS_184));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_183, typeof __VLS_185> & Record<string, unknown>) => void)({ ...{}, color: ("blue"), });
const __VLS_186 = __VLS_pickFunctionalComponentCtx(__VLS_183, __VLS_185)!;
let __VLS_187!: __VLS_NormalizeEmits<typeof __VLS_186.emit>;
(__VLS_186.slots!).default;
}
(__VLS_ctx.hours);
(__VLS_ctx.minutes);
(__VLS_ctx.seconds);
(__VLS_181.slots!).default;
}
{
const __VLS_188 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({ ...{}, }));
({} as { VCol: typeof __VLS_188; }).VCol;
({} as { VCol: typeof __VLS_188; }).VCol;
const __VLS_190 = __VLS_189({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_189));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_188, typeof __VLS_190> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_191 = __VLS_pickFunctionalComponentCtx(__VLS_188, __VLS_190)!;
let __VLS_192!: __VLS_NormalizeEmits<typeof __VLS_191.emit>;
{
const __VLS_193 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({ ...{ onClck: {} as any, }, small: (true), color: ("red"), title: ("reset user messages"), }));
({} as { VBtn: typeof __VLS_193; }).VBtn;
({} as { VBtn: typeof __VLS_193; }).VBtn;
const __VLS_195 = __VLS_194({ ...{ onClck: {} as any, }, small: (true), color: ("red"), title: ("reset user messages"), }, ...__VLS_functionalComponentArgsRest(__VLS_194));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_193, typeof __VLS_195> & Record<string, unknown>) => void)({ ...{ onClck: {} as any, }, small: (true), color: ("red"), title: ("reset user messages"), });
const __VLS_196 = __VLS_pickFunctionalComponentCtx(__VLS_193, __VLS_195)!;
let __VLS_197!: __VLS_NormalizeEmits<typeof __VLS_196.emit>;
let __VLS_198 = { 'clck': __VLS_pickEvent(__VLS_197['clck'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_194, typeof __VLS_195>).onClck) };
__VLS_198 = {
clck: $event => {
__VLS_ctx.resetUserMessages();
// @ts-ignore
[hours, minutes, seconds, resetUserMessages,];
}
};
{
const __VLS_199 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({ ...{}, }));
({} as { VIcon: typeof __VLS_199; }).VIcon;
({} as { VIcon: typeof __VLS_199; }).VIcon;
const __VLS_201 = __VLS_200({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_200));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_199, typeof __VLS_201> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_202 = __VLS_pickFunctionalComponentCtx(__VLS_199, __VLS_201)!;
let __VLS_203!: __VLS_NormalizeEmits<typeof __VLS_202.emit>;
(__VLS_202.slots!).default;
}
(__VLS_196.slots!).default;
}
(__VLS_191.slots!).default;
}
{
const __VLS_204 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({ ...{}, }));
({} as { VCol: typeof __VLS_204; }).VCol;
({} as { VCol: typeof __VLS_204; }).VCol;
const __VLS_206 = __VLS_205({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_205));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_204, typeof __VLS_206> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_207 = __VLS_pickFunctionalComponentCtx(__VLS_204, __VLS_206)!;
let __VLS_208!: __VLS_NormalizeEmits<typeof __VLS_207.emit>;
{
const __VLS_209 = __VLS_intrinsicElements["input"];
const __VLS_210 = __VLS_elementAsFunctionalComponent(__VLS_209);
const __VLS_211 = __VLS_210({ ...{}, title: ("Maximum Tradable Amount"), type: ("text"), class: ("form-control"), value: ((__VLS_ctx.maxTradableAmount)), placeholder: ("Maximum Tradable Amount"), }, ...__VLS_functionalComponentArgsRest(__VLS_210));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_209, typeof __VLS_211> & Record<string, unknown>) => void)({ ...{}, title: ("Maximum Tradable Amount"), type: ("text"), class: ("form-control"), value: ((__VLS_ctx.maxTradableAmount)), placeholder: ("Maximum Tradable Amount"), });
const __VLS_212 = __VLS_pickFunctionalComponentCtx(__VLS_209, __VLS_211)!;
let __VLS_213!: __VLS_NormalizeEmits<typeof __VLS_212.emit>;
}
(__VLS_207.slots!).default;
}
{
const __VLS_214 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({ ...{}, }));
({} as { VCol: typeof __VLS_214; }).VCol;
({} as { VCol: typeof __VLS_214; }).VCol;
const __VLS_216 = __VLS_215({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_215));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_214, typeof __VLS_216> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_217 = __VLS_pickFunctionalComponentCtx(__VLS_214, __VLS_216)!;
let __VLS_218!: __VLS_NormalizeEmits<typeof __VLS_217.emit>;
if (!__VLS_ctx.AutoMode) {
{
const __VLS_219 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({ ...{ onClick: {} as any, }, title: ("Switch to Auto"), icon: (true), color: ("green"), }));
({} as { VBtn: typeof __VLS_219; }).VBtn;
({} as { VBtn: typeof __VLS_219; }).VBtn;
const __VLS_221 = __VLS_220({ ...{ onClick: {} as any, }, title: ("Switch to Auto"), icon: (true), color: ("green"), }, ...__VLS_functionalComponentArgsRest(__VLS_220));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_219, typeof __VLS_221> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, title: ("Switch to Auto"), icon: (true), color: ("green"), });
const __VLS_222 = __VLS_pickFunctionalComponentCtx(__VLS_219, __VLS_221)!;
let __VLS_223!: __VLS_NormalizeEmits<typeof __VLS_222.emit>;
let __VLS_224 = { 'click': __VLS_pickEvent(__VLS_223['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_220, typeof __VLS_221>).onClick) };
__VLS_224 = {
click: $event => {
if (!((!__VLS_ctx.AutoMode))) return;
__VLS_ctx.AutoMode = true;
// @ts-ignore
[maxTradableAmount, maxTradableAmount, AutoMode, AutoMode,];
}
};
{
const __VLS_225 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({ ...{}, }));
({} as { VIcon: typeof __VLS_225; }).VIcon;
({} as { VIcon: typeof __VLS_225; }).VIcon;
const __VLS_227 = __VLS_226({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_226));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_225, typeof __VLS_227> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_228 = __VLS_pickFunctionalComponentCtx(__VLS_225, __VLS_227)!;
let __VLS_229!: __VLS_NormalizeEmits<typeof __VLS_228.emit>;
(__VLS_228.slots!).default;
}
(__VLS_222.slots!).default;
}
}
if (__VLS_ctx.AutoMode) {
{
const __VLS_230 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({ ...{ onClick: {} as any, }, title: (" Switch to Manual"), icon: (true), color: ("red"), }));
({} as { VBtn: typeof __VLS_230; }).VBtn;
({} as { VBtn: typeof __VLS_230; }).VBtn;
const __VLS_232 = __VLS_231({ ...{ onClick: {} as any, }, title: (" Switch to Manual"), icon: (true), color: ("red"), }, ...__VLS_functionalComponentArgsRest(__VLS_231));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_230, typeof __VLS_232> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, title: (" Switch to Manual"), icon: (true), color: ("red"), });
const __VLS_233 = __VLS_pickFunctionalComponentCtx(__VLS_230, __VLS_232)!;
let __VLS_234!: __VLS_NormalizeEmits<typeof __VLS_233.emit>;
let __VLS_235 = { 'click': __VLS_pickEvent(__VLS_234['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_231, typeof __VLS_232>).onClick) };
__VLS_235 = {
click: $event => {
if (!((__VLS_ctx.AutoMode))) return;
__VLS_ctx.AutoMode = false;
// @ts-ignore
[AutoMode, AutoMode,];
}
};
{
const __VLS_236 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({ ...{}, }));
({} as { VIcon: typeof __VLS_236; }).VIcon;
({} as { VIcon: typeof __VLS_236; }).VIcon;
const __VLS_238 = __VLS_237({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_237));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_236, typeof __VLS_238> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_239 = __VLS_pickFunctionalComponentCtx(__VLS_236, __VLS_238)!;
let __VLS_240!: __VLS_NormalizeEmits<typeof __VLS_239.emit>;
(__VLS_239.slots!).default;
}
(__VLS_233.slots!).default;
}
}
(__VLS_217.slots!).default;
}
(__VLS_136.slots!).default;
}
{
const __VLS_241 = __VLS_intrinsicElements["div"];
const __VLS_242 = __VLS_elementAsFunctionalComponent(__VLS_241);
const __VLS_243 = __VLS_242({ ...{}, class: ("col"), style: ({}), }, ...__VLS_functionalComponentArgsRest(__VLS_242));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_241, typeof __VLS_243> & Record<string, unknown>) => void)({ ...{}, class: ("col"), style: ({}), });
const __VLS_244 = __VLS_pickFunctionalComponentCtx(__VLS_241, __VLS_243)!;
let __VLS_245!: __VLS_NormalizeEmits<typeof __VLS_244.emit>;
{
const __VLS_246 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({ ...{ onClick: {} as any, }, }));
({} as { VBtn: typeof __VLS_246; }).VBtn;
({} as { VBtn: typeof __VLS_246; }).VBtn;
const __VLS_248 = __VLS_247({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_247));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_246, typeof __VLS_248> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_249 = __VLS_pickFunctionalComponentCtx(__VLS_246, __VLS_248)!;
let __VLS_250!: __VLS_NormalizeEmits<typeof __VLS_249.emit>;
let __VLS_251 = { 'click': __VLS_pickEvent(__VLS_250['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_247, typeof __VLS_248>).onClick) };
__VLS_251 = {
click: $event => {
__VLS_ctx.getLatestPricesOfClosedScripts();
// @ts-ignore
[getLatestPricesOfClosedScripts,];
}
};
(__VLS_249.slots!).default;
}
{
const __VLS_252 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }));
({} as { VChip: typeof __VLS_252; }).VChip;
({} as { VChip: typeof __VLS_252; }).VChip;
const __VLS_254 = __VLS_253({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_253));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_252, typeof __VLS_254> & Record<string, unknown>) => void)({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), });
const __VLS_255 = __VLS_pickFunctionalComponentCtx(__VLS_252, __VLS_254)!;
let __VLS_256!: __VLS_NormalizeEmits<typeof __VLS_255.emit>;
(__VLS_ctx.closedTradesScriptsPnl);
(__VLS_255.slots!).default;
}
(__VLS_ctx.closedTradesScripts.length);
{
const __VLS_257 = ({} as 'ClosedTrades' extends keyof typeof __VLS_ctx ? { 'ClosedTrades': typeof __VLS_ctx.ClosedTrades; } : typeof __VLS_resolvedLocalAndGlobalComponents).ClosedTrades;
const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({ ...{}, closedTradesScripts: ((__VLS_ctx.closedTradesScripts)), }));
({} as { ClosedTrades: typeof __VLS_257; }).ClosedTrades;
({} as { ClosedTrades: typeof __VLS_257; }).ClosedTrades;
const __VLS_259 = __VLS_258({ ...{}, closedTradesScripts: ((__VLS_ctx.closedTradesScripts)), }, ...__VLS_functionalComponentArgsRest(__VLS_258));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_257, typeof __VLS_259> & Record<string, unknown>) => void)({ ...{}, closedTradesScripts: ((__VLS_ctx.closedTradesScripts)), });
const __VLS_260 = __VLS_pickFunctionalComponentCtx(__VLS_257, __VLS_259)!;
let __VLS_261!: __VLS_NormalizeEmits<typeof __VLS_260.emit>;
}
(__VLS_244.slots!).default;
}
(__VLS_95.slots!).default;
}
{
const __VLS_262 = ({} as 'Margin' extends keyof typeof __VLS_ctx ? { 'Margin': typeof __VLS_ctx.Margin; } : typeof __VLS_resolvedLocalAndGlobalComponents).Margin;
const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({ ...{ onMarginUpdated: {} as any, }, }));
({} as { Margin: typeof __VLS_262; }).Margin;
({} as { Margin: typeof __VLS_262; }).Margin;
const __VLS_264 = __VLS_263({ ...{ onMarginUpdated: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_263));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_262, typeof __VLS_264> & Record<string, unknown>) => void)({ ...{ onMarginUpdated: {} as any, }, });
const __VLS_265 = __VLS_pickFunctionalComponentCtx(__VLS_262, __VLS_264)!;
let __VLS_266!: __VLS_NormalizeEmits<typeof __VLS_265.emit>;
let __VLS_267 = { 'margin-updated': __VLS_pickEvent(__VLS_266['margin-updated'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_263, typeof __VLS_264>).onMarginUpdated) };
__VLS_267 = { "margin-updated": (__VLS_ctx.marginUpdated) };
}
{
const __VLS_268 = __VLS_intrinsicElements["div"];
const __VLS_269 = __VLS_elementAsFunctionalComponent(__VLS_268);
const __VLS_270 = __VLS_269({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_269));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_268, typeof __VLS_270> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_271 = __VLS_pickFunctionalComponentCtx(__VLS_268, __VLS_270)!;
let __VLS_272!: __VLS_NormalizeEmits<typeof __VLS_271.emit>;
}
{
const __VLS_273 = ({} as 'VDialog' extends keyof typeof __VLS_ctx ? { 'VDialog': typeof __VLS_ctx.VDialog; } : 'vDialog' extends keyof typeof __VLS_ctx ? { 'VDialog': typeof __VLS_ctx.vDialog; } : 'v-dialog' extends keyof typeof __VLS_ctx ? { 'VDialog': (typeof __VLS_ctx)["v-dialog"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VDialog;
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({ ...{}, value: ((__VLS_ctx.dialog)), maxWidth: ("290"), }));
({} as { VDialog: typeof __VLS_273; }).VDialog;
({} as { VDialog: typeof __VLS_273; }).VDialog;
const __VLS_275 = __VLS_274({ ...{}, value: ((__VLS_ctx.dialog)), maxWidth: ("290"), }, ...__VLS_functionalComponentArgsRest(__VLS_274));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_273, typeof __VLS_275> & Record<string, unknown>) => void)({ ...{}, value: ((__VLS_ctx.dialog)), maxWidth: ("290"), });
const __VLS_276 = __VLS_pickFunctionalComponentCtx(__VLS_273, __VLS_275)!;
let __VLS_277!: __VLS_NormalizeEmits<typeof __VLS_276.emit>;
{
const __VLS_278 = ({} as 'VAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.VAlert; } : 'vAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.vAlert; } : 'v-alert' extends keyof typeof __VLS_ctx ? { 'VAlert': (typeof __VLS_ctx)["v-alert"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VAlert;
const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({ ...{}, }));
({} as { VAlert: typeof __VLS_278; }).VAlert;
({} as { VAlert: typeof __VLS_278; }).VAlert;
const __VLS_280 = __VLS_279({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_279));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_278, typeof __VLS_280> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_281 = __VLS_pickFunctionalComponentCtx(__VLS_278, __VLS_280)!;
let __VLS_282!: __VLS_NormalizeEmits<typeof __VLS_281.emit>;
{
const __VLS_283 = __VLS_intrinsicElements["ul"];
const __VLS_284 = __VLS_elementAsFunctionalComponent(__VLS_283);
const __VLS_285 = __VLS_284({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_284));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_283, typeof __VLS_285> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_286 = __VLS_pickFunctionalComponentCtx(__VLS_283, __VLS_285)!;
let __VLS_287!: __VLS_NormalizeEmits<typeof __VLS_286.emit>;
for (const [alert] of __VLS_getVForSourceType((__VLS_ctx.alerts)!)) {
{
const __VLS_288 = __VLS_intrinsicElements["li"];
const __VLS_289 = __VLS_elementAsFunctionalComponent(__VLS_288);
const __VLS_290 = __VLS_289({ ...{}, key: ((alert.code)), }, ...__VLS_functionalComponentArgsRest(__VLS_289));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_288, typeof __VLS_290> & Record<string, unknown>) => void)({ ...{}, key: ((alert.code)), });
const __VLS_291 = __VLS_pickFunctionalComponentCtx(__VLS_288, __VLS_290)!;
let __VLS_292!: __VLS_NormalizeEmits<typeof __VLS_291.emit>;
(alert.message);
(__VLS_291.slots!).default;
}
// @ts-ignore
[closedTradesScriptsPnl, closedTradesScriptsPnl, closedTradesScriptsPnl, closedTradesScriptsPnl, closedTradesScripts, closedTradesScripts, closedTradesScripts, closedTradesScripts, marginUpdated, dialog, dialog, dialog, alerts,];
}
(__VLS_286.slots!).default;
}
(__VLS_281.slots!).default;
}
(__VLS_276.slots!).default;
}
{
const __VLS_293 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({ ...{ onClick: {} as any, }, color: ("green"), }));
({} as { VBtn: typeof __VLS_293; }).VBtn;
({} as { VBtn: typeof __VLS_293; }).VBtn;
const __VLS_295 = __VLS_294({ ...{ onClick: {} as any, }, color: ("green"), }, ...__VLS_functionalComponentArgsRest(__VLS_294));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_293, typeof __VLS_295> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, color: ("green"), });
const __VLS_296 = __VLS_pickFunctionalComponentCtx(__VLS_293, __VLS_295)!;
let __VLS_297!: __VLS_NormalizeEmits<typeof __VLS_296.emit>;
let __VLS_298 = { 'click': __VLS_pickEvent(__VLS_297['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_294, typeof __VLS_295>).onClick) };
__VLS_298 = {
click: $event => {
__VLS_ctx.placeTargetsForLiveScripts();
// @ts-ignore
[placeTargetsForLiveScripts,];
}
};
(__VLS_296.slots!).default;
}
{
const __VLS_299 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({ ...{ onClick: {} as any, }, }));
({} as { VBtn: typeof __VLS_299; }).VBtn;
({} as { VBtn: typeof __VLS_299; }).VBtn;
const __VLS_301 = __VLS_300({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_300));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_299, typeof __VLS_301> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_302 = __VLS_pickFunctionalComponentCtx(__VLS_299, __VLS_301)!;
let __VLS_303!: __VLS_NormalizeEmits<typeof __VLS_302.emit>;
let __VLS_304 = { 'click': __VLS_pickEvent(__VLS_303['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_300, typeof __VLS_301>).onClick) };
__VLS_304 = {
click: $event => {
__VLS_ctx.forceUpdateMissingScripts();
// @ts-ignore
[forceUpdateMissingScripts,];
}
};
(__VLS_302.slots!).default;
}
if (__VLS_ctx.loadingHourlyTradingLows) {
{
const __VLS_305 = ({} as 'VAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.VAlert; } : 'vAlert' extends keyof typeof __VLS_ctx ? { 'VAlert': typeof __VLS_ctx.vAlert; } : 'v-alert' extends keyof typeof __VLS_ctx ? { 'VAlert': (typeof __VLS_ctx)["v-alert"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VAlert;
const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({ ...{}, type: ("info"), }));
({} as { VAlert: typeof __VLS_305; }).VAlert;
({} as { VAlert: typeof __VLS_305; }).VAlert;
const __VLS_307 = __VLS_306({ ...{}, type: ("info"), }, ...__VLS_functionalComponentArgsRest(__VLS_306));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_305, typeof __VLS_307> & Record<string, unknown>) => void)({ ...{}, type: ("info"), });
const __VLS_308 = __VLS_pickFunctionalComponentCtx(__VLS_305, __VLS_307)!;
let __VLS_309!: __VLS_NormalizeEmits<typeof __VLS_308.emit>;
(__VLS_308.slots!).default;
}
// @ts-ignore
[loadingHourlyTradingLows,];
}
{
const __VLS_310 = __VLS_intrinsicElements["div"];
const __VLS_311 = __VLS_elementAsFunctionalComponent(__VLS_310);
const __VLS_312 = __VLS_311({ ...{}, class: ("row"), }, ...__VLS_functionalComponentArgsRest(__VLS_311));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_310, typeof __VLS_312> & Record<string, unknown>) => void)({ ...{}, class: ("row"), });
const __VLS_313 = __VLS_pickFunctionalComponentCtx(__VLS_310, __VLS_312)!;
let __VLS_314!: __VLS_NormalizeEmits<typeof __VLS_313.emit>;
{
const __VLS_315 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_316 = __VLS_asFunctionalComponent(__VLS_315, new __VLS_315({ ...{}, }));
({} as { VChip: typeof __VLS_315; }).VChip;
({} as { VChip: typeof __VLS_315; }).VChip;
const __VLS_317 = __VLS_316({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_316));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_315, typeof __VLS_317> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_318 = __VLS_pickFunctionalComponentCtx(__VLS_315, __VLS_317)!;
let __VLS_319!: __VLS_NormalizeEmits<typeof __VLS_318.emit>;
(__VLS_ctx.totalForgone.toFixed(1));
(
__VLS_ctx.totalForgoneFortarget.toFixed(1)
);
(__VLS_ctx.totalForgoneForStopLoss.toFixed(1));
(__VLS_318.slots!).default;
}
(__VLS_313.slots!).default;
}
{
const __VLS_320 = ({} as 'VRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.VRow; } : 'vRow' extends keyof typeof __VLS_ctx ? { 'VRow': typeof __VLS_ctx.vRow; } : 'v-row' extends keyof typeof __VLS_ctx ? { 'VRow': (typeof __VLS_ctx)["v-row"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VRow;
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({ ...{}, }));
({} as { VRow: typeof __VLS_320; }).VRow;
({} as { VRow: typeof __VLS_320; }).VRow;
const __VLS_322 = __VLS_321({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_321));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_320, typeof __VLS_322> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_323 = __VLS_pickFunctionalComponentCtx(__VLS_320, __VLS_322)!;
let __VLS_324!: __VLS_NormalizeEmits<typeof __VLS_323.emit>;
{
const __VLS_325 = ({} as 'VCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.VCol; } : 'vCol' extends keyof typeof __VLS_ctx ? { 'VCol': typeof __VLS_ctx.vCol; } : 'v-col' extends keyof typeof __VLS_ctx ? { 'VCol': (typeof __VLS_ctx)["v-col"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VCol;
const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({ ...{}, }));
({} as { VCol: typeof __VLS_325; }).VCol;
({} as { VCol: typeof __VLS_325; }).VCol;
const __VLS_327 = __VLS_326({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_326));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_325, typeof __VLS_327> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_328 = __VLS_pickFunctionalComponentCtx(__VLS_325, __VLS_327)!;
let __VLS_329!: __VLS_NormalizeEmits<typeof __VLS_328.emit>;
(__VLS_ctx.manualReverseOrder);
{
const __VLS_330 = __VLS_intrinsicElements["input"];
const __VLS_331 = __VLS_elementAsFunctionalComponent(__VLS_330);
const __VLS_332 = __VLS_331({ ...{ onChange: {} as any, }, type: ("checkbox"), }, ...__VLS_functionalComponentArgsRest(__VLS_331));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_330, typeof __VLS_332> & Record<string, unknown>) => void)({ ...{ onChange: {} as any, }, type: ("checkbox"), });
const __VLS_333 = __VLS_pickFunctionalComponentCtx(__VLS_330, __VLS_332)!;
let __VLS_334!: __VLS_NormalizeEmits<typeof __VLS_333.emit>;
(__VLS_ctx.manualReverseOrder);
let __VLS_335 = { 'change': __VLS_pickEvent(__VLS_334['change'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_331, typeof __VLS_332>).onChange) };
__VLS_335 = { change: (__VLS_ctx.forceManualReverseOrder) };
}
(__VLS_328.slots!).default;
}
(__VLS_323.slots!).default;
}
{
const __VLS_336 = __VLS_intrinsicElements["div"];
const __VLS_337 = __VLS_elementAsFunctionalComponent(__VLS_336);
const __VLS_338 = __VLS_337({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_337));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_336, typeof __VLS_338> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_339 = __VLS_pickFunctionalComponentCtx(__VLS_336, __VLS_338)!;
let __VLS_340!: __VLS_NormalizeEmits<typeof __VLS_339.emit>;
if (false) {
{
const __VLS_341 = __VLS_intrinsicElements["table"];
const __VLS_342 = __VLS_elementAsFunctionalComponent(__VLS_341);
const __VLS_343 = __VLS_342({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_342));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_341, typeof __VLS_343> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_344 = __VLS_pickFunctionalComponentCtx(__VLS_341, __VLS_343)!;
let __VLS_345!: __VLS_NormalizeEmits<typeof __VLS_344.emit>;
for (const [script, index] of __VLS_getVForSourceType((__VLS_ctx.hourlyPricePointsofLiveDay)!)) {
{
const __VLS_346 = __VLS_intrinsicElements["tr"];
const __VLS_347 = __VLS_elementAsFunctionalComponent(__VLS_346);
const __VLS_348 = __VLS_347({ ...{}, key: ((index)), class: ("col-small"), }, ...__VLS_functionalComponentArgsRest(__VLS_347));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_346, typeof __VLS_348> & Record<string, unknown>) => void)({ ...{}, key: ((index)), class: ("col-small"), });
const __VLS_349 = __VLS_pickFunctionalComponentCtx(__VLS_346, __VLS_348)!;
let __VLS_350!: __VLS_NormalizeEmits<typeof __VLS_349.emit>;
for (const [item, index2] of __VLS_getVForSourceType((script.prices)!)) {
{
const __VLS_351 = __VLS_intrinsicElements["td"];
const __VLS_352 = __VLS_elementAsFunctionalComponent(__VLS_351);
const __VLS_353 = __VLS_352({ ...{}, key: ((index2)), class: ("col-xs"), }, ...__VLS_functionalComponentArgsRest(__VLS_352));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_351, typeof __VLS_353> & Record<string, unknown>) => void)({ ...{}, key: ((index2)), class: ("col-xs"), });
const __VLS_354 = __VLS_pickFunctionalComponentCtx(__VLS_351, __VLS_353)!;
let __VLS_355!: __VLS_NormalizeEmits<typeof __VLS_354.emit>;
{
const __VLS_356 = __VLS_intrinsicElements["div"];
const __VLS_357 = __VLS_elementAsFunctionalComponent(__VLS_356);
const __VLS_358 = __VLS_357({ ...{}, class: ("text-primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_357));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_356, typeof __VLS_358> & Record<string, unknown>) => void)({ ...{}, class: ("text-primary"), });
const __VLS_359 = __VLS_pickFunctionalComponentCtx(__VLS_356, __VLS_358)!;
let __VLS_360!: __VLS_NormalizeEmits<typeof __VLS_359.emit>;
(script.instrument.tradingsymbol);
(script.instrument_token);
(__VLS_ctx.convertIsoDateToIST(item.date));
(__VLS_359.slots!).default;
}
{
const __VLS_361 = __VLS_intrinsicElements["div"];
const __VLS_362 = __VLS_elementAsFunctionalComponent(__VLS_361);
const __VLS_363 = __VLS_362({
...{}, class: (({
'text-success': script.prices[index2].open == item.open,
})),
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_361, typeof __VLS_363> & Record<string, unknown>) => void)({
...{}, class: (({
'text-success': script.prices[index2].open == item.open,
})),
});
const __VLS_364 = __VLS_pickFunctionalComponentCtx(__VLS_361, __VLS_363)!;
let __VLS_365!: __VLS_NormalizeEmits<typeof __VLS_364.emit>;
__VLS_styleScopedClasses = ({
'text-success': script.prices[index2].open == item.open,
});
(item.open);
(__VLS_364.slots!).default;
}
((item.high + (item.high - item.low) / 2).toFixed(1));
(
item.high
);
(item.low);
(item.high - item.low);
((item.low - (item.high - item.low) / 2).toFixed(1));
(
item.close
);
(__VLS_354.slots!).default;
}
// @ts-ignore
[totalForgone, totalForgoneFortarget, totalForgoneForStopLoss, manualReverseOrder, manualReverseOrder, forceManualReverseOrder, hourlyPricePointsofLiveDay, convertIsoDateToIST,];
}
(__VLS_349.slots!).default;
}
}
(__VLS_344.slots!).default;
}
}
(__VLS_339.slots!).default;
}
{
const __VLS_366 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({ ...{ onClick: {} as any, }, }));
({} as { VBtn: typeof __VLS_366; }).VBtn;
({} as { VBtn: typeof __VLS_366; }).VBtn;
const __VLS_368 = __VLS_367({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_367));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_366, typeof __VLS_368> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_369 = __VLS_pickFunctionalComponentCtx(__VLS_366, __VLS_368)!;
let __VLS_370!: __VLS_NormalizeEmits<typeof __VLS_369.emit>;
let __VLS_371 = { 'click': __VLS_pickEvent(__VLS_370['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_367, typeof __VLS_368>).onClick) };
__VLS_371 = {
click: $event => {
__VLS_ctx.showModalForSquareOff();
// @ts-ignore
[showModalForSquareOff,];
}
};
{
const __VLS_372 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({ ...{}, }));
({} as { VIcon: typeof __VLS_372; }).VIcon;
({} as { VIcon: typeof __VLS_372; }).VIcon;
const __VLS_374 = __VLS_373({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_373));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_372, typeof __VLS_374> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_375 = __VLS_pickFunctionalComponentCtx(__VLS_372, __VLS_374)!;
let __VLS_376!: __VLS_NormalizeEmits<typeof __VLS_375.emit>;
}
(__VLS_369.slots!).default;
}
{
const __VLS_377 = __VLS_intrinsicElements["button"];
const __VLS_378 = __VLS_elementAsFunctionalComponent(__VLS_377);
const __VLS_379 = __VLS_378({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_378));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_377, typeof __VLS_379> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_380 = __VLS_pickFunctionalComponentCtx(__VLS_377, __VLS_379)!;
let __VLS_381!: __VLS_NormalizeEmits<typeof __VLS_380.emit>;
let __VLS_382 = { 'click': __VLS_pickEvent(__VLS_381['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_378, typeof __VLS_379>).onClick) };
__VLS_382 = {
click: $event => {
__VLS_ctx.review();
// @ts-ignore
[review,];
}
};
(__VLS_380.slots!).default;
}
{
const __VLS_383 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_384 = __VLS_asFunctionalComponent(__VLS_383, new __VLS_383({ ...{ onClick: {} as any, }, }));
({} as { VBtn: typeof __VLS_383; }).VBtn;
({} as { VBtn: typeof __VLS_383; }).VBtn;
const __VLS_385 = __VLS_384({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_384));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_383, typeof __VLS_385> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_386 = __VLS_pickFunctionalComponentCtx(__VLS_383, __VLS_385)!;
let __VLS_387!: __VLS_NormalizeEmits<typeof __VLS_386.emit>;
let __VLS_388 = { 'click': __VLS_pickEvent(__VLS_387['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_384, typeof __VLS_385>).onClick) };
__VLS_388 = {
click: $event => {
__VLS_ctx.getOrders();
// @ts-ignore
[getOrders,];
}
};
(__VLS_386.slots!).default;
}
{
const __VLS_389 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({ ...{ onClick: {} as any, }, }));
({} as { VBtn: typeof __VLS_389; }).VBtn;
({} as { VBtn: typeof __VLS_389; }).VBtn;
const __VLS_391 = __VLS_390({ ...{ onClick: {} as any, }, }, ...__VLS_functionalComponentArgsRest(__VLS_390));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_389, typeof __VLS_391> & Record<string, unknown>) => void)({ ...{ onClick: {} as any, }, });
const __VLS_392 = __VLS_pickFunctionalComponentCtx(__VLS_389, __VLS_391)!;
let __VLS_393!: __VLS_NormalizeEmits<typeof __VLS_392.emit>;
let __VLS_394 = { 'click': __VLS_pickEvent(__VLS_393['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_390, typeof __VLS_391>).onClick) };
__VLS_394 = {
click: $event => {
__VLS_ctx.refreshTradeStatus();
// @ts-ignore
[refreshTradeStatus,];
}
};
(__VLS_392.slots!).default;
}
(__VLS_ctx.instrumentsFiltered.length);
(__VLS_ctx.instrumentTokens.length);
{
const __VLS_395 = __VLS_intrinsicElements["div"];
const __VLS_396 = __VLS_elementAsFunctionalComponent(__VLS_395);
const __VLS_397 = __VLS_396({ ...{}, class: ("row"), }, ...__VLS_functionalComponentArgsRest(__VLS_396));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_395, typeof __VLS_397> & Record<string, unknown>) => void)({ ...{}, class: ("row"), });
const __VLS_398 = __VLS_pickFunctionalComponentCtx(__VLS_395, __VLS_397)!;
let __VLS_399!: __VLS_NormalizeEmits<typeof __VLS_398.emit>;
{
const __VLS_400 = __VLS_intrinsicElements["div"];
const __VLS_401 = __VLS_elementAsFunctionalComponent(__VLS_400);
const __VLS_402 = __VLS_401({ ...{}, class: ("col offset"), }, ...__VLS_functionalComponentArgsRest(__VLS_401));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_400, typeof __VLS_402> & Record<string, unknown>) => void)({ ...{}, class: ("col offset"), });
const __VLS_403 = __VLS_pickFunctionalComponentCtx(__VLS_400, __VLS_402)!;
let __VLS_404!: __VLS_NormalizeEmits<typeof __VLS_403.emit>;
{
const __VLS_405 = __VLS_intrinsicElements["h1"];
const __VLS_406 = __VLS_elementAsFunctionalComponent(__VLS_405);
const __VLS_407 = __VLS_406({ ...{}, class: ("text-success"), }, ...__VLS_functionalComponentArgsRest(__VLS_406));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_405, typeof __VLS_407> & Record<string, unknown>) => void)({ ...{}, class: ("text-success"), });
const __VLS_408 = __VLS_pickFunctionalComponentCtx(__VLS_405, __VLS_407)!;
let __VLS_409!: __VLS_NormalizeEmits<typeof __VLS_408.emit>;
(__VLS_408.slots!).default;
}
{
const __VLS_410 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_411 = __VLS_asFunctionalComponent(__VLS_410, new __VLS_410({ ...{}, color: ((__VLS_ctx.totalpnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }));
({} as { VChip: typeof __VLS_410; }).VChip;
({} as { VChip: typeof __VLS_410; }).VChip;
const __VLS_412 = __VLS_411({ ...{}, color: ((__VLS_ctx.totalpnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_411));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_410, typeof __VLS_412> & Record<string, unknown>) => void)({ ...{}, color: ((__VLS_ctx.totalpnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), });
const __VLS_413 = __VLS_pickFunctionalComponentCtx(__VLS_410, __VLS_412)!;
let __VLS_414!: __VLS_NormalizeEmits<typeof __VLS_413.emit>;
(__VLS_ctx.totalpnl);
(__VLS_413.slots!).default;
}
{
const __VLS_415 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_416 = __VLS_asFunctionalComponent(__VLS_415, new __VLS_415({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }));
({} as { VChip: typeof __VLS_415; }).VChip;
({} as { VChip: typeof __VLS_415; }).VChip;
const __VLS_417 = __VLS_416({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_416));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_415, typeof __VLS_417> & Record<string, unknown>) => void)({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), });
const __VLS_418 = __VLS_pickFunctionalComponentCtx(__VLS_415, __VLS_417)!;
let __VLS_419!: __VLS_NormalizeEmits<typeof __VLS_418.emit>;
(__VLS_ctx.closedTradesScriptsPnl);
(__VLS_418.slots!).default;
}
{
const __VLS_420 = ({} as 'VChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.VChip; } : 'vChip' extends keyof typeof __VLS_ctx ? { 'VChip': typeof __VLS_ctx.vChip; } : 'v-chip' extends keyof typeof __VLS_ctx ? { 'VChip': (typeof __VLS_ctx)["v-chip"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VChip;
const __VLS_421 = __VLS_asFunctionalComponent(__VLS_420, new __VLS_420({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl + __VLS_ctx.totalpnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }));
({} as { VChip: typeof __VLS_420; }).VChip;
({} as { VChip: typeof __VLS_420; }).VChip;
const __VLS_422 = __VLS_421({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl + __VLS_ctx.totalpnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_421));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_420, typeof __VLS_422> & Record<string, unknown>) => void)({ ...{}, color: ((__VLS_ctx.closedTradesScriptsPnl + __VLS_ctx.totalpnl > 0 ? 'green' : 'red')), class: ("pb-2 mb-2"), });
const __VLS_423 = __VLS_pickFunctionalComponentCtx(__VLS_420, __VLS_422)!;
let __VLS_424!: __VLS_NormalizeEmits<typeof __VLS_423.emit>;
(__VLS_ctx.closedTradesScriptsPnl + __VLS_ctx.totalpnl);
(__VLS_423.slots!).default;
}
{
const __VLS_425 = __VLS_intrinsicElements["div"];
const __VLS_426 = __VLS_elementAsFunctionalComponent(__VLS_425);
const __VLS_427 = __VLS_426({ ...{}, class: ("row"), }, ...__VLS_functionalComponentArgsRest(__VLS_426));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_425, typeof __VLS_427> & Record<string, unknown>) => void)({ ...{}, class: ("row"), });
const __VLS_428 = __VLS_pickFunctionalComponentCtx(__VLS_425, __VLS_427)!;
let __VLS_429!: __VLS_NormalizeEmits<typeof __VLS_428.emit>;
{
const __VLS_430 = __VLS_intrinsicElements["div"];
const __VLS_431 = __VLS_elementAsFunctionalComponent(__VLS_430);
const __VLS_432 = __VLS_431({ ...{}, class: ("col-10"), }, ...__VLS_functionalComponentArgsRest(__VLS_431));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_430, typeof __VLS_432> & Record<string, unknown>) => void)({ ...{}, class: ("col-10"), });
const __VLS_433 = __VLS_pickFunctionalComponentCtx(__VLS_430, __VLS_432)!;
let __VLS_434!: __VLS_NormalizeEmits<typeof __VLS_433.emit>;
{
const __VLS_435 = ({} as 'LivePos' extends keyof typeof __VLS_ctx ? { 'LivePos': typeof __VLS_ctx.LivePos; } : typeof __VLS_resolvedLocalAndGlobalComponents).LivePos;
const __VLS_436 = __VLS_asFunctionalComponent(__VLS_435, new __VLS_435({ ...{ onConvertIsoDateToIST: {} as any, onGetReverseOrderAndHasLiveTargetStatusForChild: {} as any, onGetStopLossFromChild: {} as any, }, convertIsoDateToISTResult: ((__VLS_ctx.convertIsoDateToISTResultChild)), getReverseOrderAndHasLiveTargetStatusForChildResult: ((__VLS_ctx.getReverseOrderAndHasLiveTargetStatusForChildResult)), livePositionsDisplay: ((__VLS_ctx.livePositionsDisplay)), getStopLossResult: ((__VLS_ctx.stopLossForChild)), }));
({} as { LivePos: typeof __VLS_435; }).LivePos;
({} as { LivePos: typeof __VLS_435; }).LivePos;
const __VLS_437 = __VLS_436({ ...{ onConvertIsoDateToIST: {} as any, onGetReverseOrderAndHasLiveTargetStatusForChild: {} as any, onGetStopLossFromChild: {} as any, }, convertIsoDateToISTResult: ((__VLS_ctx.convertIsoDateToISTResultChild)), getReverseOrderAndHasLiveTargetStatusForChildResult: ((__VLS_ctx.getReverseOrderAndHasLiveTargetStatusForChildResult)), livePositionsDisplay: ((__VLS_ctx.livePositionsDisplay)), getStopLossResult: ((__VLS_ctx.stopLossForChild)), }, ...__VLS_functionalComponentArgsRest(__VLS_436));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_435, typeof __VLS_437> & Record<string, unknown>) => void)({ ...{ onConvertIsoDateToIST: {} as any, onGetReverseOrderAndHasLiveTargetStatusForChild: {} as any, onGetStopLossFromChild: {} as any, }, convertIsoDateToISTResult: ((__VLS_ctx.convertIsoDateToISTResultChild)), getReverseOrderAndHasLiveTargetStatusForChildResult: ((__VLS_ctx.getReverseOrderAndHasLiveTargetStatusForChildResult)), livePositionsDisplay: ((__VLS_ctx.livePositionsDisplay)), getStopLossResult: ((__VLS_ctx.stopLossForChild)), });
const __VLS_438 = __VLS_pickFunctionalComponentCtx(__VLS_435, __VLS_437)!;
let __VLS_439!: __VLS_NormalizeEmits<typeof __VLS_438.emit>;
let __VLS_440 = { 'convertIsoDateToIST': __VLS_pickEvent(__VLS_439['convertIsoDateToIST'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_436, typeof __VLS_437>).onConvertIsoDateToIST) };
__VLS_440 = { convertIsoDateToIST: (__VLS_ctx.convertIsoDateToISTChild) };
let __VLS_441 = { 'getReverseOrderAndHasLiveTargetStatusForChild': __VLS_pickEvent(__VLS_439['getReverseOrderAndHasLiveTargetStatusForChild'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_436, typeof __VLS_437>).onGetReverseOrderAndHasLiveTargetStatusForChild) };
__VLS_441 = { getReverseOrderAndHasLiveTargetStatusForChild: (__VLS_ctx.getReverseOrderAndHasLiveTargetStatusForChild) };
let __VLS_442 = { 'getStopLossFromChild': __VLS_pickEvent(__VLS_439['getStopLossFromChild'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_436, typeof __VLS_437>).onGetStopLossFromChild) };
__VLS_442 = { getStopLossFromChild: (__VLS_ctx.getStopLossFromChild) };
}
(__VLS_433.slots!).default;
}
{
const __VLS_443 = __VLS_intrinsicElements["div"];
const __VLS_444 = __VLS_elementAsFunctionalComponent(__VLS_443);
const __VLS_445 = __VLS_444({ ...{}, class: ("col-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_444));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_443, typeof __VLS_445> & Record<string, unknown>) => void)({ ...{}, class: ("col-2"), });
const __VLS_446 = __VLS_pickFunctionalComponentCtx(__VLS_443, __VLS_445)!;
let __VLS_447!: __VLS_NormalizeEmits<typeof __VLS_446.emit>;
{
const __VLS_448 = ({} as 'LiveOrders' extends keyof typeof __VLS_ctx ? { 'LiveOrders': typeof __VLS_ctx.LiveOrders; } : typeof __VLS_resolvedLocalAndGlobalComponents).LiveOrders;
const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({ ...{}, liveOrders: ((__VLS_ctx.liveOrders)), }));
({} as { LiveOrders: typeof __VLS_448; }).LiveOrders;
({} as { LiveOrders: typeof __VLS_448; }).LiveOrders;
const __VLS_450 = __VLS_449({ ...{}, liveOrders: ((__VLS_ctx.liveOrders)), }, ...__VLS_functionalComponentArgsRest(__VLS_449));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_448, typeof __VLS_450> & Record<string, unknown>) => void)({ ...{}, liveOrders: ((__VLS_ctx.liveOrders)), });
const __VLS_451 = __VLS_pickFunctionalComponentCtx(__VLS_448, __VLS_450)!;
let __VLS_452!: __VLS_NormalizeEmits<typeof __VLS_451.emit>;
}
(__VLS_446.slots!).default;
}
(__VLS_428.slots!).default;
}
if (false) {
{
const __VLS_453 = __VLS_intrinsicElements["div"];
const __VLS_454 = __VLS_elementAsFunctionalComponent(__VLS_453);
const __VLS_455 = __VLS_454({ ...{}, class: ("row fixTableHead"), }, ...__VLS_functionalComponentArgsRest(__VLS_454));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_453, typeof __VLS_455> & Record<string, unknown>) => void)({ ...{}, class: ("row fixTableHead"), });
const __VLS_456 = __VLS_pickFunctionalComponentCtx(__VLS_453, __VLS_455)!;
let __VLS_457!: __VLS_NormalizeEmits<typeof __VLS_456.emit>;
{
const __VLS_458 = __VLS_intrinsicElements["div"];
const __VLS_459 = __VLS_elementAsFunctionalComponent(__VLS_458);
const __VLS_460 = __VLS_459({ ...{}, class: ("col"), }, ...__VLS_functionalComponentArgsRest(__VLS_459));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_458, typeof __VLS_460> & Record<string, unknown>) => void)({ ...{}, class: ("col"), });
const __VLS_461 = __VLS_pickFunctionalComponentCtx(__VLS_458, __VLS_460)!;
let __VLS_462!: __VLS_NormalizeEmits<typeof __VLS_461.emit>;
{
const __VLS_463 = __VLS_intrinsicElements["table"];
const __VLS_464 = __VLS_elementAsFunctionalComponent(__VLS_463);
const __VLS_465 = __VLS_464({ ...{}, class: ("table table bordered table-stripped"), }, ...__VLS_functionalComponentArgsRest(__VLS_464));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_463, typeof __VLS_465> & Record<string, unknown>) => void)({ ...{}, class: ("table table bordered table-stripped"), });
const __VLS_466 = __VLS_pickFunctionalComponentCtx(__VLS_463, __VLS_465)!;
let __VLS_467!: __VLS_NormalizeEmits<typeof __VLS_466.emit>;
{
const __VLS_468 = __VLS_intrinsicElements["thead"];
const __VLS_469 = __VLS_elementAsFunctionalComponent(__VLS_468);
const __VLS_470 = __VLS_469({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_469));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_468, typeof __VLS_470> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_471 = __VLS_pickFunctionalComponentCtx(__VLS_468, __VLS_470)!;
let __VLS_472!: __VLS_NormalizeEmits<typeof __VLS_471.emit>;
{
const __VLS_473 = __VLS_intrinsicElements["th"];
const __VLS_474 = __VLS_elementAsFunctionalComponent(__VLS_473);
const __VLS_475 = __VLS_474({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_474));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_473, typeof __VLS_475> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_476 = __VLS_pickFunctionalComponentCtx(__VLS_473, __VLS_475)!;
let __VLS_477!: __VLS_NormalizeEmits<typeof __VLS_476.emit>;
(__VLS_476.slots!).default;
}
{
const __VLS_478 = __VLS_intrinsicElements["th"];
const __VLS_479 = __VLS_elementAsFunctionalComponent(__VLS_478);
const __VLS_480 = __VLS_479({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_479));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_478, typeof __VLS_480> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_481 = __VLS_pickFunctionalComponentCtx(__VLS_478, __VLS_480)!;
let __VLS_482!: __VLS_NormalizeEmits<typeof __VLS_481.emit>;
(__VLS_481.slots!).default;
}
{
const __VLS_483 = __VLS_intrinsicElements["th"];
const __VLS_484 = __VLS_elementAsFunctionalComponent(__VLS_483);
const __VLS_485 = __VLS_484({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_484));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_483, typeof __VLS_485> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_486 = __VLS_pickFunctionalComponentCtx(__VLS_483, __VLS_485)!;
let __VLS_487!: __VLS_NormalizeEmits<typeof __VLS_486.emit>;
(__VLS_486.slots!).default;
}
{
const __VLS_488 = __VLS_intrinsicElements["th"];
const __VLS_489 = __VLS_elementAsFunctionalComponent(__VLS_488);
const __VLS_490 = __VLS_489({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_489));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_488, typeof __VLS_490> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_491 = __VLS_pickFunctionalComponentCtx(__VLS_488, __VLS_490)!;
let __VLS_492!: __VLS_NormalizeEmits<typeof __VLS_491.emit>;
(__VLS_491.slots!).default;
}
{
const __VLS_493 = __VLS_intrinsicElements["th"];
const __VLS_494 = __VLS_elementAsFunctionalComponent(__VLS_493);
const __VLS_495 = __VLS_494({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_494));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_493, typeof __VLS_495> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_496 = __VLS_pickFunctionalComponentCtx(__VLS_493, __VLS_495)!;
let __VLS_497!: __VLS_NormalizeEmits<typeof __VLS_496.emit>;
(__VLS_496.slots!).default;
}
{
const __VLS_498 = __VLS_intrinsicElements["th"];
const __VLS_499 = __VLS_elementAsFunctionalComponent(__VLS_498);
const __VLS_500 = __VLS_499({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_499));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_498, typeof __VLS_500> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_501 = __VLS_pickFunctionalComponentCtx(__VLS_498, __VLS_500)!;
let __VLS_502!: __VLS_NormalizeEmits<typeof __VLS_501.emit>;
(__VLS_501.slots!).default;
}
{
const __VLS_503 = __VLS_intrinsicElements["th"];
const __VLS_504 = __VLS_elementAsFunctionalComponent(__VLS_503);
const __VLS_505 = __VLS_504({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_504));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_503, typeof __VLS_505> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_506 = __VLS_pickFunctionalComponentCtx(__VLS_503, __VLS_505)!;
let __VLS_507!: __VLS_NormalizeEmits<typeof __VLS_506.emit>;
(__VLS_506.slots!).default;
}
{
const __VLS_508 = __VLS_intrinsicElements["th"];
const __VLS_509 = __VLS_elementAsFunctionalComponent(__VLS_508);
const __VLS_510 = __VLS_509({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_509));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_508, typeof __VLS_510> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_511 = __VLS_pickFunctionalComponentCtx(__VLS_508, __VLS_510)!;
let __VLS_512!: __VLS_NormalizeEmits<typeof __VLS_511.emit>;
(__VLS_511.slots!).default;
}
(__VLS_471.slots!).default;
}
{
const __VLS_513 = __VLS_intrinsicElements["tbody"];
const __VLS_514 = __VLS_elementAsFunctionalComponent(__VLS_513);
const __VLS_515 = __VLS_514({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_514));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_513, typeof __VLS_515> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_516 = __VLS_pickFunctionalComponentCtx(__VLS_513, __VLS_515)!;
let __VLS_517!: __VLS_NormalizeEmits<typeof __VLS_516.emit>;
for (const [i, index] of __VLS_getVForSourceType((__VLS_ctx.instrumentsFiltered)!)) {
{
const __VLS_518 = __VLS_intrinsicElements["tr"];
const __VLS_519 = __VLS_elementAsFunctionalComponent(__VLS_518);
const __VLS_520 = __VLS_519({ ...{}, key: ((i.instrument_tocken)), }, ...__VLS_functionalComponentArgsRest(__VLS_519));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_518, typeof __VLS_520> & Record<string, unknown>) => void)({ ...{}, key: ((i.instrument_tocken)), });
const __VLS_521 = __VLS_pickFunctionalComponentCtx(__VLS_518, __VLS_520)!;
let __VLS_522!: __VLS_NormalizeEmits<typeof __VLS_521.emit>;
{
const __VLS_523 = __VLS_intrinsicElements["td"];
const __VLS_524 = __VLS_elementAsFunctionalComponent(__VLS_523);
const __VLS_525 = __VLS_524({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_524));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_523, typeof __VLS_525> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_526 = __VLS_pickFunctionalComponentCtx(__VLS_523, __VLS_525)!;
let __VLS_527!: __VLS_NormalizeEmits<typeof __VLS_526.emit>;
(index + 1);
(__VLS_526.slots!).default;
}
{
const __VLS_528 = __VLS_intrinsicElements["td"];
const __VLS_529 = __VLS_elementAsFunctionalComponent(__VLS_528);
const __VLS_530 = __VLS_529({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_529));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_528, typeof __VLS_530> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_531 = __VLS_pickFunctionalComponentCtx(__VLS_528, __VLS_530)!;
let __VLS_532!: __VLS_NormalizeEmits<typeof __VLS_531.emit>;
(i.name);
{
const __VLS_533 = __VLS_intrinsicElements["div"];
const __VLS_534 = __VLS_elementAsFunctionalComponent(__VLS_533);
const __VLS_535 = __VLS_534({ ...{}, class: ("row mt-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_534));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_533, typeof __VLS_535> & Record<string, unknown>) => void)({ ...{}, class: ("row mt-2"), });
const __VLS_536 = __VLS_pickFunctionalComponentCtx(__VLS_533, __VLS_535)!;
let __VLS_537!: __VLS_NormalizeEmits<typeof __VLS_536.emit>;
{
const __VLS_538 = __VLS_intrinsicElements["div"];
const __VLS_539 = __VLS_elementAsFunctionalComponent(__VLS_538);
const __VLS_540 = __VLS_539({ ...{}, class: ("col-xs mr-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_539));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_538, typeof __VLS_540> & Record<string, unknown>) => void)({ ...{}, class: ("col-xs mr-2"), });
const __VLS_541 = __VLS_pickFunctionalComponentCtx(__VLS_538, __VLS_540)!;
let __VLS_542!: __VLS_NormalizeEmits<typeof __VLS_541.emit>;
{
const __VLS_543 = __VLS_intrinsicElements["small"];
const __VLS_544 = __VLS_elementAsFunctionalComponent(__VLS_543);
const __VLS_545 = __VLS_544({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_544));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_543, typeof __VLS_545> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_546 = __VLS_pickFunctionalComponentCtx(__VLS_543, __VLS_545)!;
let __VLS_547!: __VLS_NormalizeEmits<typeof __VLS_546.emit>;
(i.spot_price);
(__VLS_546.slots!).default;
}
(__VLS_541.slots!).default;
}
{
const __VLS_548 = __VLS_intrinsicElements["div"];
const __VLS_549 = __VLS_elementAsFunctionalComponent(__VLS_548);
const __VLS_550 = __VLS_549({ ...{}, class: ("col-xs mr-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_549));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_548, typeof __VLS_550> & Record<string, unknown>) => void)({ ...{}, class: ("col-xs mr-2"), });
const __VLS_551 = __VLS_pickFunctionalComponentCtx(__VLS_548, __VLS_550)!;
let __VLS_552!: __VLS_NormalizeEmits<typeof __VLS_551.emit>;
{
const __VLS_553 = __VLS_intrinsicElements["small"];
const __VLS_554 = __VLS_elementAsFunctionalComponent(__VLS_553);
const __VLS_555 = __VLS_554({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_554));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_553, typeof __VLS_555> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_556 = __VLS_pickFunctionalComponentCtx(__VLS_553, __VLS_555)!;
let __VLS_557!: __VLS_NormalizeEmits<typeof __VLS_556.emit>;
(i.lot_size);
(__VLS_556.slots!).default;
}
(__VLS_551.slots!).default;
}
{
const __VLS_558 = __VLS_intrinsicElements["div"];
const __VLS_559 = __VLS_elementAsFunctionalComponent(__VLS_558);
const __VLS_560 = __VLS_559({ ...{}, class: ("col-xs mr-2"), }, ...__VLS_functionalComponentArgsRest(__VLS_559));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_558, typeof __VLS_560> & Record<string, unknown>) => void)({ ...{}, class: ("col-xs mr-2"), });
const __VLS_561 = __VLS_pickFunctionalComponentCtx(__VLS_558, __VLS_560)!;
let __VLS_562!: __VLS_NormalizeEmits<typeof __VLS_561.emit>;
}
(__VLS_536.slots!).default;
}
(__VLS_531.slots!).default;
}
{
const __VLS_563 = __VLS_intrinsicElements["td"];
const __VLS_564 = __VLS_elementAsFunctionalComponent(__VLS_563);
const __VLS_565 = __VLS_564({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_564));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_563, typeof __VLS_565> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_566 = __VLS_pickFunctionalComponentCtx(__VLS_563, __VLS_565)!;
let __VLS_567!: __VLS_NormalizeEmits<typeof __VLS_566.emit>;
(i.strike);
(__VLS_566.slots!).default;
}
{
const __VLS_568 = __VLS_intrinsicElements["td"];
const __VLS_569 = __VLS_elementAsFunctionalComponent(__VLS_568);
const __VLS_570 = __VLS_569({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_569));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_568, typeof __VLS_570> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_571 = __VLS_pickFunctionalComponentCtx(__VLS_568, __VLS_570)!;
let __VLS_572!: __VLS_NormalizeEmits<typeof __VLS_571.emit>;
{
const __VLS_573 = __VLS_intrinsicElements["a"];
const __VLS_574 = __VLS_elementAsFunctionalComponent(__VLS_573);
const __VLS_575 = __VLS_574({ ...{}, target: ("_blank"), href: ((i.chart)), }, ...__VLS_functionalComponentArgsRest(__VLS_574));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_573, typeof __VLS_575> & Record<string, unknown>) => void)({ ...{}, target: ("_blank"), href: ((i.chart)), });
const __VLS_576 = __VLS_pickFunctionalComponentCtx(__VLS_573, __VLS_575)!;
let __VLS_577!: __VLS_NormalizeEmits<typeof __VLS_576.emit>;
(i.tradingsymbol);
(__VLS_576.slots!).default;
}
(__VLS_571.slots!).default;
}
{
const __VLS_578 = __VLS_intrinsicElements["td"];
const __VLS_579 = __VLS_elementAsFunctionalComponent(__VLS_578);
const __VLS_580 = __VLS_579({ ...{}, class: ((i.candle)), }, ...__VLS_functionalComponentArgsRest(__VLS_579));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_578, typeof __VLS_580> & Record<string, unknown>) => void)({ ...{}, class: ((i.candle)), });
const __VLS_581 = __VLS_pickFunctionalComponentCtx(__VLS_578, __VLS_580)!;
let __VLS_582!: __VLS_NormalizeEmits<typeof __VLS_581.emit>;
__VLS_styleScopedClasses = (i.candle);
(i.last_price);
{
const __VLS_583 = __VLS_intrinsicElements["small"];
const __VLS_584 = __VLS_elementAsFunctionalComponent(__VLS_583);
const __VLS_585 = __VLS_584({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_584));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_583, typeof __VLS_585> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_586 = __VLS_pickFunctionalComponentCtx(__VLS_583, __VLS_585)!;
let __VLS_587!: __VLS_NormalizeEmits<typeof __VLS_586.emit>;
(i.lot_size * i.last_price);
(__VLS_586.slots!).default;
}
(__VLS_581.slots!).default;
}
{
const __VLS_588 = __VLS_intrinsicElements["td"];
const __VLS_589 = __VLS_elementAsFunctionalComponent(__VLS_588);
const __VLS_590 = __VLS_589({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_589));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_588, typeof __VLS_590> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_591 = __VLS_pickFunctionalComponentCtx(__VLS_588, __VLS_590)!;
let __VLS_592!: __VLS_NormalizeEmits<typeof __VLS_591.emit>;
(i.instrument_type);
(__VLS_591.slots!).default;
}
{
const __VLS_593 = __VLS_intrinsicElements["td"];
const __VLS_594 = __VLS_elementAsFunctionalComponent(__VLS_593);
const __VLS_595 = __VLS_594({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_594));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_593, typeof __VLS_595> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_596 = __VLS_pickFunctionalComponentCtx(__VLS_593, __VLS_595)!;
let __VLS_597!: __VLS_NormalizeEmits<typeof __VLS_596.emit>;
(i.pricePoints.yesterday.high);
(__VLS_596.slots!).default;
}
{
const __VLS_598 = __VLS_intrinsicElements["td"];
const __VLS_599 = __VLS_elementAsFunctionalComponent(__VLS_598);
const __VLS_600 = __VLS_599({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_599));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_598, typeof __VLS_600> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_601 = __VLS_pickFunctionalComponentCtx(__VLS_598, __VLS_600)!;
let __VLS_602!: __VLS_NormalizeEmits<typeof __VLS_601.emit>;
{
const __VLS_603 = __VLS_intrinsicElements["select"];
const __VLS_604 = __VLS_elementAsFunctionalComponent(__VLS_603);
const __VLS_605 = __VLS_604({ ...{ onChange: {} as any, }, name: (""), id: (""), value: ((i.seletedBuyingMethod)), }, ...__VLS_functionalComponentArgsRest(__VLS_604));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_603, typeof __VLS_605> & Record<string, unknown>) => void)({ ...{ onChange: {} as any, }, name: (""), id: (""), value: ((i.seletedBuyingMethod)), });
const __VLS_606 = __VLS_pickFunctionalComponentCtx(__VLS_603, __VLS_605)!;
let __VLS_607!: __VLS_NormalizeEmits<typeof __VLS_606.emit>;
let __VLS_608 = { 'change': __VLS_pickEvent(__VLS_607['change'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_604, typeof __VLS_605>).onChange) };
__VLS_608 = {
change: $event => {
if (!((false))) return;
__VLS_ctx.changeBuyingMethod(i);
// @ts-ignore
[instrumentsFiltered, instrumentTokens, totalpnl, totalpnl, totalpnl, totalpnl, closedTradesScriptsPnl, closedTradesScriptsPnl, closedTradesScriptsPnl, closedTradesScriptsPnl, closedTradesScriptsPnl, totalpnl, closedTradesScriptsPnl, totalpnl, closedTradesScriptsPnl, totalpnl, closedTradesScriptsPnl, totalpnl, convertIsoDateToISTResultChild, getReverseOrderAndHasLiveTargetStatusForChildResult, livePositionsDisplay, stopLossForChild, convertIsoDateToISTResultChild, getReverseOrderAndHasLiveTargetStatusForChildResult, livePositionsDisplay, stopLossForChild, convertIsoDateToISTResultChild, getReverseOrderAndHasLiveTargetStatusForChildResult, livePositionsDisplay, stopLossForChild, convertIsoDateToISTChild, getReverseOrderAndHasLiveTargetStatusForChild, getStopLossFromChild, liveOrders, liveOrders, liveOrders, instrumentsFiltered, changeBuyingMethod,];
}
};
for (const [bp] of __VLS_getVForSourceType((__VLS_ctx.buyingPoint)!)) {
{
const __VLS_609 = __VLS_intrinsicElements["option"];
const __VLS_610 = __VLS_elementAsFunctionalComponent(__VLS_609);
const __VLS_611 = __VLS_610({ ...{}, value: ((bp)), key: ((bp)), }, ...__VLS_functionalComponentArgsRest(__VLS_610));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_609, typeof __VLS_611> & Record<string, unknown>) => void)({ ...{}, value: ((bp)), key: ((bp)), });
const __VLS_612 = __VLS_pickFunctionalComponentCtx(__VLS_609, __VLS_611)!;
let __VLS_613!: __VLS_NormalizeEmits<typeof __VLS_612.emit>;
(bp);
(__VLS_612.slots!).default;
}
// @ts-ignore
[buyingPoint,];
}
(__VLS_606.slots!).default;
}
if (i.SevenDayMaxMin) {
{
const __VLS_614 = __VLS_intrinsicElements["small"];
const __VLS_615 = __VLS_elementAsFunctionalComponent(__VLS_614);
const __VLS_616 = __VLS_615({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_615));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_614, typeof __VLS_616> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_617 = __VLS_pickFunctionalComponentCtx(__VLS_614, __VLS_616)!;
let __VLS_618!: __VLS_NormalizeEmits<typeof __VLS_617.emit>;
}
}
(i.pricePoints.d1.high);
{
const __VLS_619 = ({} as 'VBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.VBtn; } : 'vBtn' extends keyof typeof __VLS_ctx ? { 'VBtn': typeof __VLS_ctx.vBtn; } : 'button' extends keyof typeof __VLS_ctx ? { 'VBtn': (typeof __VLS_ctx)["button"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VBtn;
const __VLS_620 = __VLS_asFunctionalComponent(__VLS_619, new __VLS_619({
...{ onClick: {} as any, }, fab: (true), small: (true), title: ((`ENTER NOW TO TRADE for  Amt ${i.SevenDayMaxMin.Max * i.lot_size} `)),
}));
({} as { VBtn: typeof __VLS_619; }).VBtn;
({} as { VBtn: typeof __VLS_619; }).VBtn;
const __VLS_621 = __VLS_620({
...{ onClick: {} as any, }, fab: (true), small: (true), title: ((`ENTER NOW TO TRADE for  Amt ${i.SevenDayMaxMin.Max * i.lot_size} `)),
}, ...__VLS_functionalComponentArgsRest(__VLS_620));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_619, typeof __VLS_621> & Record<string, unknown>) => void)({
...{ onClick: {} as any, }, fab: (true), small: (true), title: ((`ENTER NOW TO TRADE for  Amt ${i.SevenDayMaxMin.Max * i.lot_size} `)),
});
const __VLS_622 = __VLS_pickFunctionalComponentCtx(__VLS_619, __VLS_621)!;
let __VLS_623!: __VLS_NormalizeEmits<typeof __VLS_622.emit>;
let __VLS_624 = { 'click': __VLS_pickEvent(__VLS_623['click'], ({} as __VLS_FunctionalComponentProps<typeof __VLS_620, typeof __VLS_621>).onClick) };
__VLS_624 = {
click: $event => {
if (!((false))) return;
__VLS_ctx.noTradingNow(i);
// @ts-ignore
[noTradingNow,];
}
};
{
const __VLS_625 = ({} as 'VIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.VIcon; } : 'vIcon' extends keyof typeof __VLS_ctx ? { 'VIcon': typeof __VLS_ctx.vIcon; } : 'span' extends keyof typeof __VLS_ctx ? { 'VIcon': (typeof __VLS_ctx)["span"]; } : typeof __VLS_resolvedLocalAndGlobalComponents).VIcon;
const __VLS_626 = __VLS_asFunctionalComponent(__VLS_625, new __VLS_625({ ...{}, color: ("green"), }));
({} as { VIcon: typeof __VLS_625; }).VIcon;
({} as { VIcon: typeof __VLS_625; }).VIcon;
const __VLS_627 = __VLS_626({ ...{}, color: ("green"), }, ...__VLS_functionalComponentArgsRest(__VLS_626));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_625, typeof __VLS_627> & Record<string, unknown>) => void)({ ...{}, color: ("green"), });
const __VLS_628 = __VLS_pickFunctionalComponentCtx(__VLS_625, __VLS_627)!;
let __VLS_629!: __VLS_NormalizeEmits<typeof __VLS_628.emit>;
(__VLS_628.slots!).default;
}
(__VLS_622.slots!).default;
}
(__VLS_601.slots!).default;
}
(__VLS_521.slots!).default;
}
}
(__VLS_516.slots!).default;
}
(__VLS_466.slots!).default;
}
(__VLS_461.slots!).default;
}
(__VLS_456.slots!).default;
}
}
{
const __VLS_630 = __VLS_intrinsicElements["hr"];
const __VLS_631 = __VLS_elementAsFunctionalComponent(__VLS_630);
const __VLS_632 = __VLS_631({ ...{}, }, ...__VLS_functionalComponentArgsRest(__VLS_631));
({} as (props: __VLS_FunctionalComponentProps<typeof __VLS_630, typeof __VLS_632> & Record<string, unknown>) => void)({ ...{}, });
const __VLS_633 = __VLS_pickFunctionalComponentCtx(__VLS_630, __VLS_632)!;
let __VLS_634!: __VLS_NormalizeEmits<typeof __VLS_633.emit>;
}
(__VLS_403.slots!).default;
}
(__VLS_398.slots!).default;
}
(__VLS_3.slots!).default;
}
if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
__VLS_styleScopedClasses["btn-primary"];
__VLS_styleScopedClasses["mt-1"];
__VLS_styleScopedClasses["form-control"];
__VLS_styleScopedClasses["col"];
__VLS_styleScopedClasses["pb-2"];
__VLS_styleScopedClasses["mb-2"];
__VLS_styleScopedClasses["row"];
__VLS_styleScopedClasses["col-small"];
__VLS_styleScopedClasses["col-xs"];
__VLS_styleScopedClasses["text-primary"];
__VLS_styleScopedClasses["row"];
__VLS_styleScopedClasses["col"];
__VLS_styleScopedClasses["offset"];
__VLS_styleScopedClasses["text-success"];
__VLS_styleScopedClasses["pb-2"];
__VLS_styleScopedClasses["mb-2"];
__VLS_styleScopedClasses["pb-2"];
__VLS_styleScopedClasses["mb-2"];
__VLS_styleScopedClasses["pb-2"];
__VLS_styleScopedClasses["mb-2"];
__VLS_styleScopedClasses["row"];
__VLS_styleScopedClasses["col-10"];
__VLS_styleScopedClasses["col-2"];
__VLS_styleScopedClasses["row"];
__VLS_styleScopedClasses["fixTableHead"];
__VLS_styleScopedClasses["col"];
__VLS_styleScopedClasses["table"];
__VLS_styleScopedClasses["table"];
__VLS_styleScopedClasses["bordered"];
__VLS_styleScopedClasses["table-stripped"];
__VLS_styleScopedClasses["row"];
__VLS_styleScopedClasses["mt-2"];
__VLS_styleScopedClasses["col-xs"];
__VLS_styleScopedClasses["mr-2"];
__VLS_styleScopedClasses["col-xs"];
__VLS_styleScopedClasses["mr-2"];
__VLS_styleScopedClasses["col-xs"];
__VLS_styleScopedClasses["mr-2"];
}
var __VLS_slots!: {};
return __VLS_slots;
}
