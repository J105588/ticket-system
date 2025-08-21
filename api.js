class GasAPI {
  static async checkInSeat(group, day, timeslot, seatIds) {
    // 座席IDリストを受け取り、各座席の形式を検証
    const invalidSeats = seatIds.filter(seatId => !isValidSeatId(seatId));
    if (invalidSeats.length > 0) {
      throw new Error(`無効な座席IDが含まれています: ${invalidSeats.join(', ')}`);
    }
    return this._callApi('checkInSeat', [group, day, timeslot, seatIds]);
  }

  static async getSeatData(group, day, timeslot, isAdmin) {
    return this._callApi('getSeatData', [group, day, timeslot, isAdmin]);
  }

  static async _callApi(func, params) {
    const response = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ func, params })
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`Server Error: ${errorResponse.error}`);
    }
    return await response.json();
  }
}

// 座席IDの形式を検証するヘルパー関数
function isValidSeatId(seatId) {
  const match = seatId.match(/^([A-E])(\d+)$/);
  if (!match) return false;
  const row = match[1];
  const col = parseInt(match[2], 10);
  const maxSeats = { 'A': 12, 'B': 12, 'C': 12, 'D': 12, 'E': 6 };
  return col >= 1 && col <= (maxSeats[row] || 0);
}
