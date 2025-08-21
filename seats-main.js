async function checkIn(seatIds) {
  if (!seatIds || seatIds.length === 0) {
    alert('座席を1つ以上選択してください。');
    return;
  }

  // 選択した座席のIDをバリデーション
  const invalidSeats = seatIds.filter(id => !isValidSeatId(id));
  if (invalidSeats.length > 0) {
    alert(`無効な座席IDがあります: ${invalidSeats.join(', ')}`);
    return;
  }

  let confirmMessage = `チェックインしますか？\n${seatIds.join('\n')}`;
  if (!confirm(confirmMessage)) return;

  showLoader(true);

  try {
    const res = await GasAPI.checkInSeat(GROUP, DAY, TIMESLOT, seatIds);
    alert(res.message);
    // 成功した場合、座席データを再取得して表示
    if (res.success) {
      const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, IS_ADMIN);
      drawSeatMap(seatData.seatMap);
    }
  } catch (error) {
    alert(`エラー: ${error.message}`);
  } finally {
    showLoader(false);
  }
}

function createSeatElement(seat) {
  const el = document.createElement('div');
  el.className = `seat ${seat.status}`;
  el.dataset.id = seat.id;
  el.innerHTML = `<span class="seat-id">${seat.id}</span>`;

  if (IS_ADMIN) {
    // 管理者モードなら、座席名を表示
    if (seat.name) {
      el.innerHTML += `<span class="seat-name">${seat.name}</span>`;
    }

    // チェックインボックスを追加
    if (seat.status === 'to-be-checked-in' || seat.status === 'reserved') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'check-in-checkbox';
      checkbox.dataset.seatId = seat.id;
      el.appendChild(checkbox);
    }
  }

  return el;
}

// 通常の座席データを表示する関数
function drawSeatMap(seatMap) {
  const seatContainer = document.getElementById('seat-container');
  seatContainer.innerHTML = '';
  seatMap.forEach(seat => {
    const seatElement = createSeatElement(seat);
    seatContainer.appendChild(seatElement);
  });
}

// ローダーの表示
function showLoader(isLoading) {
  const loader = document.getElementById('loader');
  loader.style.display = isLoading ? 'block' : 'none';
}
